<?php

namespace Tests\Feature;

use App\Models\Lot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LotPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_lists_only_active_lots(): void
    {
        Lot::factory()->create();
        Lot::factory()->upcoming()->create();
        Lot::factory()->sold()->create();

        $this->get(route('lots.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('lots/index')
                ->has('lots', 2));
    }

    public function test_index_filters_by_province_and_type(): void
    {
        Lot::factory()->create(['province' => 'Gauteng', 'property_type' => 'House']);
        Lot::factory()->create(['province' => 'Gauteng', 'property_type' => 'Commercial']);
        Lot::factory()->create(['province' => 'Limpopo', 'property_type' => 'House']);

        $this->get(route('lots.index', ['province' => 'Gauteng', 'type' => 'House']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('lots', 1)
                ->where('filters.province', 'Gauteng')
                ->where('filters.type', 'House'));
    }

    public function test_index_shows_empty_state_when_nothing_matches(): void
    {
        Lot::factory()->create(['province' => 'Gauteng']);

        $this->get(route('lots.index', ['province' => 'Free State']))
            ->assertInertia(fn (Assert $page) => $page->has('lots', 0));
    }

    public function test_show_renders_a_lot_by_slug(): void
    {
        $lot = Lot::factory()->create();

        $this->get(route('lots.show', $lot))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('lots/show')
                ->where('lot.web_ref', $lot->web_ref)
                ->where('lot.opening_bid', $lot->opening_bid));
    }

    public function test_show_returns_404_for_unknown_slug(): void
    {
        $this->get('/lots/does-not-exist')->assertNotFound();
    }
}
