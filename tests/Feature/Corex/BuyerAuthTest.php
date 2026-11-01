<?php

namespace Tests\Feature\Corex;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\FakesCorex;
use Tests\TestCase;

class BuyerAuthTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    private function loginResponse(): array
    {
        return ['ok' => true, 'token' => 'cxb_new', 'expires_at' => now()->addDays(30)->toIso8601String(), 'buyer' => ['email' => 'bea@example.com', 'name' => 'Bea', 'phone' => null]];
    }

    public function test_login_stores_the_token_in_the_session_and_returns_to_where_the_buyer_was(): void
    {
        $this->fakeCorex(['/buyers/login' => Http::response($this->loginResponse())]);

        $this->post(route('buyer.login.store'), ['email' => 'bea@example.com', 'password' => 'secret', 'return' => '/auctions/12/lots/34'])
            ->assertRedirect('/auctions/12/lots/34')
            ->assertSessionHas('corex.buyer_token', 'cxb_new')
            ->assertSessionHas('corex.buyer.name', 'Bea');
    }

    public function test_login_never_redirects_to_another_site(): void
    {
        $this->fakeCorex(['/buyers/login' => Http::response($this->loginResponse())]);

        $this->post(route('buyer.login.store'), ['email' => 'bea@example.com', 'password' => 'secret', 'return' => '//evil.example/steal'])
            ->assertRedirect('/account');
    }

    public function test_wrong_details_show_the_corex_message_beside_the_email(): void
    {
        $this->fakeCorex(['/buyers/login' => Http::response(['message' => 'Invalid', 'errors' => ['email' => ['These details do not match our records.']]], 422)]);

        $this->post(route('buyer.login.store'), ['email' => 'bea@example.com', 'password' => 'wrong'])
            ->assertSessionHasErrors(['email' => 'These details do not match our records.'])
            ->assertSessionMissing('corex.buyer_token');
    }

    public function test_too_many_attempts_shows_a_wait_message(): void
    {
        $this->fakeCorex(['/buyers/login' => Http::response(['message' => 'Too many', 'code' => 'rate_limited'], 429)]);

        $this->from(route('buyer.login'))
            ->post(route('buyer.login.store'), ['email' => 'bea@example.com', 'password' => 'secret'])
            ->assertRedirect(route('buyer.login'))
            ->assertSessionHasErrors(['form' => 'Too many attempts, please wait a minute and try again.']);
    }

    public function test_signup_sends_a_code_then_verifies_and_logs_in(): void
    {
        $this->fakeCorex([
            '/buyers/signup/send' => Http::response(['ok' => true]),
            '/buyers/signup/verify' => Http::response($this->loginResponse(), 201),
        ]);

        $this->post(route('buyer.signup.send'), ['email' => 'bea@example.com'])->assertSessionHasNoErrors();

        $this->post(route('buyer.signup.verify'), [
            'email' => 'bea@example.com', 'code' => '123456', 'name' => 'Bea', 'phone' => '', 'password' => 'secret-pass',
            'password_confirmation' => 'secret-pass', 'popia_consent' => true, 'return' => '/auctions',
        ])->assertRedirect('/auctions')->assertSessionHas('corex.buyer_token', 'cxb_new');

        $this->assertCorexSent('POST', '/buyers/signup/verify', fn (ClientRequest $request) => $request['popia_consent'] === true
            && $request['code'] === '123456'
            && $request['password_confirmation'] === 'secret-pass');
    }

    public function test_signup_requires_popia_consent(): void
    {
        $this->fakeCorex();

        $this->post(route('buyer.signup.verify'), ['email' => 'bea@example.com', 'code' => '123456', 'name' => 'Bea', 'password' => 'x', 'password_confirmation' => 'x'])
            ->assertSessionHasErrors(['popia_consent' => 'Please accept so the agency may process your details.']);

        $this->assertCorexNotCalled('/buyers/signup/verify');
    }

    public function test_password_reset_logs_the_buyer_in(): void
    {
        $this->fakeCorex(['/buyers/forgot/reset' => Http::response($this->loginResponse())]);

        $this->post(route('buyer.forgot.reset'), ['email' => 'bea@example.com', 'code' => '123456', 'password' => 'new-pass', 'password_confirmation' => 'new-pass'])
            ->assertRedirect('/account')
            ->assertSessionHas('corex.buyer_token', 'cxb_new');
    }

    public function test_logout_revokes_the_token_in_corex_and_clears_the_session(): void
    {
        $this->fakeCorex(['/buyers/logout' => Http::response(['ok' => true])]);

        $this->actingAsBuyer('cxb_old')
            ->post(route('buyer.logout'))
            ->assertRedirect(route('auctions.index'))
            ->assertSessionMissing('corex.buyer_token');

        $this->assertCorexSent('POST', '/buyers/logout', fn (ClientRequest $request) => $request->hasHeader('X-Buyer-Token', 'cxb_old'));
    }

    public function test_account_page_sends_logged_out_visitors_to_login_with_a_return_link(): void
    {
        $this->get(route('buyer.account'))->assertRedirect(route('buyer.login', ['return' => '/account']));
    }

    public function test_an_invalid_token_logs_the_buyer_out_and_returns_them_after_login(): void
    {
        $this->fakeCorex(['/buyers/me' => Http::response(['message' => 'Unauthenticated', 'code' => 'buyer_token_invalid'], 401)]);

        $this->actingAsBuyer()
            ->get(route('buyer.account'))
            ->assertRedirect(route('buyer.login', ['return' => '/account']))
            ->assertSessionMissing('corex.buyer_token');
    }

    public function test_account_page_shows_the_buyer_overview(): void
    {
        $this->fakeCorex(['/buyers/me' => Http::response(['data' => [
            'buyer' => ['email' => 'buyer@example.com', 'name' => 'Bea', 'phone' => null],
            'registrations' => [['id' => 1, 'auction_id' => 12, 'status' => 'approved', 'bidder_type' => 'individual', 'bidder_number' => 7, 'declined_reason' => null]],
            'lots_won' => [], 'watching' => [], 'invoices' => [],
        ]])]);

        $this->actingAsBuyer()
            ->get(route('buyer.account'))
            ->assertInertia(fn (Assert $page) => $page->component('account/index')->where('account.registrations.0.bidder_number', 7));
    }

    public function test_updating_details_saves_them_in_corex(): void
    {
        $this->fakeCorex(['/buyers/me' => Http::response(['ok' => true])]);

        $this->actingAsBuyer()
            ->put(route('buyer.account.update'), ['name' => 'Bea Bidder', 'phone' => '082 000 0000'])
            ->assertSessionHas('corex.buyer.name', 'Bea Bidder');

        $this->assertCorexSent('PUT', '/buyers/me', fn (ClientRequest $request) => $request['name'] === 'Bea Bidder');
    }

    public function test_logged_in_buyers_skip_the_login_page(): void
    {
        $this->actingAsBuyer()->get(route('buyer.login', ['return' => '/auctions/12']))->assertRedirect('/auctions/12');
    }

    private function assertCorexNotCalled(string $path): void
    {
        Http::assertNotSent(fn (ClientRequest $request) => $request->url() === self::COREX_API.$path);
    }
}
