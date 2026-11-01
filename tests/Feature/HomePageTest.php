<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\FakesCorex;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    public function test_home_page_renders_without_corex_configured(): void
    {
        Http::fake();

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('corexSite', null)
                ->where('liveAuctions', [])
                ->where('sellEnabled', false)
                ->has('contactSubjects', 5));

        Http::assertNothingSent();
    }

    public function test_home_page_shows_corex_auctions_and_the_sell_form_when_enabled(): void
    {
        $this->fakeCorex([
            '?phase=live' => Http::response(['data' => [$this->corexAuction()]]),
            '?phase=upcoming' => Http::response(['data' => [$this->corexAuction(['id' => 13, 'phase' => 'upcoming'])]]),
        ]);

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('corexSite.agency.name', 'Test Agency')
                ->where('liveAuctions.0.id', 12)
                ->where('upcomingAuctions.0.id', 13)
                ->where('sellEnabled', true));
    }

    public function test_home_page_hides_the_sell_form_when_the_agency_switched_it_off(): void
    {
        $this->fakeCorex(site: ['features' => ['seller_questionnaire' => false]]);

        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('sellEnabled', false));
    }

    public function test_home_page_still_renders_when_corex_is_down(): void
    {
        $this->configureCorex();
        Http::fake(['*' => Http::response(['message' => 'Server error'], 500)]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('corexSite', null)->where('liveAuctions', []));
    }
}
