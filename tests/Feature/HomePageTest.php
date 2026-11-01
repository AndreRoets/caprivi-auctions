<?php

namespace Tests\Feature;

use App\Models\Lot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_renders_without_lots(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('featuredLot', null)
                ->has('contactSubjects', 5));
    }

    public function test_home_page_prefers_the_featured_lot(): void
    {
        Lot::factory()->create(['bidding_closes_at' => now()->addDay()]);
        $featured = Lot::factory()->featured()->create(['bidding_closes_at' => now()->addDays(10)]);

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('featuredLot.slug', $featured->slug));
    }

    public function test_home_page_falls_back_to_the_soonest_closing_active_lot(): void
    {
        Lot::factory()->sold()->featured()->create();
        Lot::factory()->create(['bidding_closes_at' => now()->addDays(9)]);
        $soonest = Lot::factory()->create(['bidding_closes_at' => now()->addDays(2)]);

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page->where('featuredLot.slug', $soonest->slug));
    }
}
