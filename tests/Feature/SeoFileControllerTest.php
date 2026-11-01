<?php

namespace Tests\Feature;

use App\Support\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\FakesCorex;
use Tests\TestCase;

class SeoFileControllerTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    public function test_robots_txt_blocks_admin_and_account_areas_and_points_to_the_sitemap(): void
    {
        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('Disallow: /admin')
            ->assertSee('Disallow: /account')
            ->assertSee('Sitemap: '.route('sitemap'));
    }

    public function test_robots_txt_blocks_everything_when_indexing_is_off(): void
    {
        app(SiteSettings::class)->update(['seo_allow_indexing' => false]);

        $this->get('/robots.txt')
            ->assertSee("Disallow: /\n", false)
            ->assertDontSee('Sitemap:');
    }

    public function test_sitemap_lists_public_pages_and_live_and_upcoming_auctions(): void
    {
        $this->fakeCorex([
            '?phase=live' => Http::response(['data' => [$this->corexAuction(['id' => 12])]]),
            '?phase=upcoming' => Http::response(['data' => [$this->corexAuction(['id' => 13, 'phase' => 'upcoming'])]]),
            '?phase=finished' => Http::response(['data' => [$this->corexAuction(['id' => 9, 'phase' => 'finished'])]]),
        ]);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml')
            ->assertSee('<loc>'.route('home').'</loc>', false)
            ->assertSee('<loc>'.route('auctions.index').'</loc>', false)
            ->assertSee('<loc>'.route('auctions.show', 12).'</loc>', false)
            ->assertSee('<loc>'.route('auctions.show', 13).'</loc>', false)
            ->assertDontSee('<loc>'.route('auctions.show', 9).'</loc>', false);
    }
}
