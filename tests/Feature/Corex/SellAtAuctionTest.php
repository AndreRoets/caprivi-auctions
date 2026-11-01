<?php

namespace Tests\Feature\Corex;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\FakesCorex;
use Tests\TestCase;

class SellAtAuctionTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function answers(array $overrides = []): array
    {
        return [
            'seller_type' => 'individual', 'name' => 'Thandi Mokoena', 'email' => 'thandi@example.com', 'phone' => '082 123 4567',
            'preferred_contact' => 'phone', 'property_type' => 'house', 'address' => '1 Main Road', 'suburb' => 'Waterkloof',
            'features' => ['pool'], 'occupancy' => 'owner', 'condition' => 'good', 'has_bond' => false, 'price_expectation' => 2450000,
            'auction_format' => 'online', 'reserve' => 'confidential', 'timing' => '1_3_months', 'viewing' => 'appointment',
            'documents' => ['title_deed'], 'consent_terms' => true, 'consent_authorised' => true, 'consent_processing' => true,
            'marketing_opt_in' => false, 'website' => '',
            ...$overrides,
        ];
    }

    public function test_answers_and_honeypot_are_forwarded_to_corex_and_its_response_text_is_shown(): void
    {
        $this->fakeCorex(['/sell' => Http::response(['ok' => true, 'message' => 'Received', 'response_text' => 'within two hours'], 201)]);

        $this->from('/')
            ->post(route('seller-questionnaire.store'), $this->answers(['unexpected_field' => 'drop me', 'website' => 'http://bot.example']))
            ->assertRedirect('/')
            ->assertSessionHas('sell_response', 'within two hours');

        $this->assertCorexSent('POST', '/sell', fn (ClientRequest $request) => $request['price_expectation'] === 2450000
            && $request['features'] === ['pool']
            && $request['website'] === 'http://bot.example'
            && ! isset($request['unexpected_field']));
    }

    public function test_corex_validation_errors_are_returned_per_field(): void
    {
        $this->fakeCorex(['/sell' => Http::response(['message' => 'Invalid', 'errors' => ['suburb' => ['Please enter the suburb.']]], 422)]);

        $this->post(route('seller-questionnaire.store'), $this->answers(['suburb' => '']))
            ->assertSessionHasErrors(['suburb' => 'Please enter the suburb.']);
    }

    public function test_rate_limited_submissions_ask_the_seller_to_wait(): void
    {
        $this->fakeCorex(['/sell' => Http::response(['message' => 'Too many', 'code' => 'rate_limited'], 429)]);

        $this->post(route('seller-questionnaire.store'), $this->answers())
            ->assertSessionHasErrors(['form' => 'Too many attempts, please wait a minute and try again.']);
    }

    public function test_a_switched_off_form_is_404(): void
    {
        $this->fakeCorex(['/sell' => Http::response(['message' => 'Not found'], 404)]);

        $this->post(route('seller-questionnaire.store'), $this->answers())->assertNotFound();
    }
}
