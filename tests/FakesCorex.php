<?php

namespace Tests;

use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;

/**
 * Mocked CoreX API responses for feature tests.
 */
trait FakesCorex
{
    protected const COREX_API = 'https://corex.test/api/v1/website/auctions';

    protected function configureCorex(): void
    {
        config([
            'services.corex.auctions_api' => self::COREX_API,
            'services.corex.api_key' => 'test-key',
        ]);
    }

    /**
     * Fakes CoreX: the given path => response pairs, plus /site and empty auction lists.
     *
     * @param  array<string, mixed>  $responses  paths relative to the API base, e.g. '/12' or '/buyers/login'
     */
    protected function fakeCorex(array $responses = [], array $site = []): void
    {
        $this->configureCorex();

        $fakes = [];
        foreach ($responses as $path => $response) {
            $fakes[self::COREX_API.$path] = $response;
        }

        Http::fake([
            ...$fakes,
            self::COREX_API.'/site' => Http::response(['data' => array_replace_recursive($this->corexSite(), $site)]),
            self::COREX_API.'?phase=*' => Http::response(['data' => []]),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function corexSite(): array
    {
        return [
            'agency' => ['slug' => 'test-agency', 'name' => 'Test Agency', 'logo_url' => null, 'email' => 'hello@agency.test', 'phone' => '010 000 0000'],
            'site' => [
                'title' => 'Bid on property online', 'intro' => 'Live and upcoming auctions.', 'hero_image_url' => null, 'how_it_works' => null,
                'footer_text' => null, 'contact_email' => null, 'contact_phone' => null, 'show_past_auctions' => false, 'currency' => 'ZAR', 'public_page_url' => null,
            ],
            'colors' => ['brand' => '#0e2235', 'on_brand' => '#ffffff', 'button' => '#c8963e', 'on_button' => '#0e2235'],
            'features' => ['seller_questionnaire' => true, 'bidding_activity' => true, 'bidder_numbers_visible' => true],
            'seller_questionnaire' => [
                'response_text' => 'within one business day',
                'seller_types' => ['individual' => 'An individual owner'],
                'property_types' => ['house' => 'House'],
                'auction_formats' => ['online' => 'Online'],
                'contact_methods' => ['phone' => 'Phone'],
                'features' => ['pool' => 'Pool'],
                'occupancy' => ['owner' => 'Owner occupied', 'tenant' => 'Tenanted'],
                'conditions' => ['good' => 'Good'],
                'reserve' => ['confidential' => 'Yes, protect my minimum', 'none' => 'No reserve'],
                'timing' => ['1_3_months' => 'Within 1–3 months'],
                'viewing' => ['appointment' => 'By appointment'],
                'documents' => ['title_deed' => 'Title deed copy'],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function corexAuction(array $overrides = []): array
    {
        return [
            'id' => 12, 'reference' => 'AUC-12', 'title' => 'November property auction', 'phase' => 'live', 'phase_label' => 'Live',
            'status' => 'published', 'format' => 'timed', 'starts_at' => '2026-11-01T08:00:00+02:00', 'ends_at' => '2026-11-20T14:00:00+02:00',
            'venue_name' => null, 'lots_count' => 1, 'image_url' => null, 'public_page_url' => null,
            ...$overrides,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function corexLot(array $overrides = []): array
    {
        return [
            'id' => 34, 'auction_id' => 12, 'lot_number' => 1, 'title' => 'Three-bedroom home', 'status' => 'active', 'suburb' => 'Waterkloof', 'city' => 'Pretoria',
            'opening_bid' => 250000, 'guide_price_min' => null, 'guide_price_max' => null, 'image_url' => null, 'bedrooms' => 3, 'bathrooms' => 2, 'garages' => 1,
            'description' => 'A lovely home.', 'floor_size_m2' => 180, 'photos' => [], 'documents' => [], 'hidden_documents' => 0,
            'auction' => ['id' => 12, 'title' => 'November property auction', 'reference' => 'AUC-12', 'format' => 'timed', 'phase' => 'live', 'registration_open' => true],
            'fee_notice' => null,
            'bidding' => $this->corexBidding(),
            'my_registration' => null,
            'watching' => false,
            ...$overrides,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function corexBidding(array $overrides = []): array
    {
        return [
            'lot_status' => 'active', 'phase' => 'open', 'server_now' => '2026-11-01T10:00:00+02:00', 'opens_at' => '2026-11-01T08:00:00+02:00',
            'closes_at' => '2026-11-20T14:00:00+02:00', 'seconds_left' => 1000, 'current_bid' => 260000, 'opening_bid' => 250000,
            'min_next' => 270000, 'increment' => 10000, 'reserve' => 'not_met', 'you' => null, 'currency' => 'ZAR', 'your_auto_bid' => null,
            ...$overrides,
        ];
    }

    /**
     * Logs a buyer in by putting a CoreX token in the session.
     */
    protected function actingAsBuyer(string $token = 'cxb_test'): static
    {
        return $this->withSession([
            'corex.buyer_token' => $token,
            'corex.buyer_expires_at' => now()->addDays(30)->toIso8601String(),
            'corex.buyer' => ['email' => 'buyer@example.com', 'name' => 'Bea Buyer', 'phone' => null],
        ]);
    }

    protected function assertCorexSent(string $method, string $path, ?callable $extra = null): void
    {
        Http::assertSent(fn (ClientRequest $request) => $request->method() === $method
            && $request->url() === self::COREX_API.$path
            && ($extra === null || $extra($request)));
    }
}
