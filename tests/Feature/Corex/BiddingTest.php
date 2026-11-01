<?php

namespace Tests\Feature\Corex;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\FakesCorex;
use Tests\TestCase;

class BiddingTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    public function test_logged_out_visitors_get_a_login_link_instead_of_bidding(): void
    {
        $this->fakeCorex();

        $this->postJson(route('lots.bids.store', 34), ['amount' => 270000])
            ->assertUnauthorized()
            ->assertJsonPath('code', 'login_required')
            ->assertJsonStructure(['login_url']);

        Http::assertNothingSent();
    }

    public function test_a_bid_is_forwarded_with_the_buyer_token_and_returns_the_new_state(): void
    {
        $this->fakeCorex(['/lots/34/bids' => Http::response(['ok' => true, 'data' => [
            'bidding' => $this->corexBidding(['current_bid' => 270000, 'min_next' => 280000, 'you' => 'winning']),
            'my_registration' => ['status' => 'approved', 'bidder_number' => 7],
            'watching' => false,
        ]])]);

        $this->actingAsBuyer('cxb_bidder')
            ->postJson(route('lots.bids.store', 34), ['amount' => 270000])
            ->assertOk()
            ->assertJsonPath('data.bidding.you', 'winning')
            ->assertJsonPath('data.bidding.min_next', 280000);

        $this->assertCorexSent('POST', '/lots/34/bids', fn (ClientRequest $request) => $request['amount'] === 270000
            && $request->hasHeader('X-Buyer-Token', 'cxb_bidder'));
    }

    public function test_corex_refusals_are_shown_in_plain_language(): void
    {
        $this->fakeCorex(['/lots/34/bids' => Http::response(['message' => 'Your bid must be at least R 280 000.'], 422)]);

        $this->actingAsBuyer()
            ->postJson(route('lots.bids.store', 34), ['amount' => 270000])
            ->assertUnprocessable()
            ->assertJsonPath('errors.form.0', 'Your bid must be at least R 280 000.');
    }

    public function test_unapproved_bidders_are_told_they_need_an_approved_registration(): void
    {
        $this->fakeCorex(['/lots/34/bids' => Http::response(['message' => 'Registration pending (internal ref 99)'], 403)]);

        $this->actingAsBuyer()
            ->postJson(route('lots.bids.store', 34), ['amount' => 270000])
            ->assertForbidden()
            ->assertJsonPath('message', 'You need an approved registration for this auction before you can bid.')
            ->assertDontSee('internal ref');
    }

    public function test_bid_amount_must_be_a_whole_number(): void
    {
        $this->fakeCorex();

        $this->actingAsBuyer()->postJson(route('lots.bids.store', 34), ['amount' => 'lots'])->assertJsonValidationErrors('amount');
        $this->assertCorexNotCalled('/lots/34/bids');
    }

    public function test_auto_bid_can_be_set_and_cancelled(): void
    {
        $state = ['ok' => true, 'data' => ['bidding' => $this->corexBidding(['your_auto_bid' => 400000]), 'my_registration' => null, 'watching' => false]];
        $this->fakeCorex(['/lots/34/auto-bid' => Http::response($state)]);

        $this->actingAsBuyer()->postJson(route('lots.auto-bid.store', 34), ['max' => 400000])->assertJsonPath('data.bidding.your_auto_bid', 400000);
        $this->actingAsBuyer()->deleteJson(route('lots.auto-bid.destroy', 34))->assertOk();

        $this->assertCorexSent('POST', '/lots/34/auto-bid', fn (ClientRequest $request) => $request['max'] === 400000);
        $this->assertCorexSent('DELETE', '/lots/34/auto-bid');
    }

    public function test_watch_toggles_in_corex(): void
    {
        $this->fakeCorex(['/lots/34/watch' => Http::response(['ok' => true, 'watching' => true])]);

        $this->actingAsBuyer()->postJson(route('lots.watch', 34))->assertJsonPath('watching', true);
    }

    private function assertCorexNotCalled(string $path): void
    {
        Http::assertNotSent(fn (ClientRequest $request) => $request->url() === self::COREX_API.$path);
    }
}
