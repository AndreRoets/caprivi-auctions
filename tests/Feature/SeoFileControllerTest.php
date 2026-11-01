<?php

namespace Tests\Feature;

use App\Models\Lot;
use App\Support\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoFileControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_robots_txt_blocks_admin_areas_and_points_to_the_sitemap(): void
    {
        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('Disallow: /admin')
            ->assertSee('Sitemap: '.route('sitemap'));
    }

    public function test_robots_txt_blocks_everything_when_indexing_is_off(): void
    {
        app(SiteSettings::class)->update(['seo_allow_indexing' => false]);

        $this->get('/robots.txt')
            ->assertSee("Disallow: /\n", false)
            ->assertDontSee('Sitemap:');
    }

    public function test_sitemap_lists_public_pages_and_every_lot(): void
    {
        $active = Lot::factory()->create();
        $sold = Lot::factory()->sold()->create();

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml')
            ->assertSee('<loc>'.route('home').'</loc>', false)
            ->assertSee('<loc>'.route('lots.index').'</loc>', false)
            ->assertSee('<loc>'.route('lots.show', $active).'</loc>', false)
            ->assertSee('<loc>'.route('lots.show', $sold).'</loc>', false);
    }
}
