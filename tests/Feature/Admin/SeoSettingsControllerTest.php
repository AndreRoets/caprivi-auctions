<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Support\SiteSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SeoSettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'seo_description' => 'Default description.',
            'seo_keywords' => 'auctions, property',
            'seo_allow_indexing' => '1',
            'seo_twitter_handle' => '@caprivi',
            'seo_google_verification' => 'abc123-XYZ',
            'seo_bing_verification' => null,
            'seo_google_analytics_id' => 'G-ABC1234567',
            'seo_google_tag_manager_id' => null,
            'seo_pages' => [
                'home' => ['title' => 'Property auctions in Gauteng', 'description' => 'Sell your home at auction.'],
                'lots' => ['title' => 'Houses on auction', 'description' => 'Browse every lot.'],
            ],
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('admin.seo.edit'))->assertRedirect(route('login'));
        $this->post(route('admin.seo.update'), $this->validPayload())->assertRedirect(route('login'));
    }

    public function test_saved_settings_are_rendered_in_the_public_page_head(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.seo.update'), $this->validPayload())
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->get(route('home'))
            ->assertSee('<title inertia>Property auctions in Gauteng - Caprivi Auctions</title>', false)
            ->assertSee('<meta inertia="description" name="description" content="Sell your home at auction.">', false)
            ->assertSee('<meta name="robots" content="index, follow">', false)
            ->assertSee('<meta name="google-site-verification" content="abc123-XYZ">', false)
            ->assertSee('https://www.googletagmanager.com/gtag/js?id=G-ABC1234567', false)
            ->assertSee('"@type":"RealEstateAgent"', false);

        $this->get(route('lots.index'))
            ->assertSee('<title inertia>Houses on auction - Caprivi Auctions</title>', false);
    }

    public function test_page_text_is_escaped_in_the_head(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.seo.update'), $this->validPayload([
                'seo_pages' => [
                    'home' => ['title' => 'Home', 'description' => '"><script>alert(1)</script>'],
                    'lots' => ['title' => 'Lots', 'description' => 'Browse.'],
                ],
            ]));

        $this->get(route('home'))
            ->assertDontSee('<script>alert(1)</script>', false)
            ->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false);
    }

    public function test_turning_off_indexing_marks_pages_noindex(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.seo.update'), $this->validPayload(['seo_allow_indexing' => '0']));

        $this->get(route('home'))->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    }

    public function test_uploads_and_removes_the_sharing_image(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.seo.update'), $this->validPayload([
                'seo_image' => UploadedFile::fake()->image('share.jpg', 1200, 630),
            ]))
            ->assertSessionHasNoErrors();

        $path = app(SiteSettings::class)->get('seo_image');
        Storage::disk('public')->assertExists($path);
        $this->get(route('home'))
            ->assertSee('<meta inertia="og:image" property="og:image" content="'.asset('storage/'.$path).'">', false);

        $this->actingAs($admin)
            ->post(route('admin.seo.update'), $this->validPayload(['remove_seo_image' => '1']))
            ->assertSessionHasNoErrors();

        Storage::disk('public')->assertMissing($path);
        $this->assertNull(app(SiteSettings::class)->get('seo_image'));
    }

    public function test_rejects_malformed_tracking_ids_and_verification_snippets(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.seo.update'), $this->validPayload([
                'seo_google_analytics_id' => "G-1');alert(1)//",
                'seo_google_tag_manager_id' => 'UA-12345',
                'seo_google_verification' => '<meta name="google-site-verification" content="abc">',
            ]))
            ->assertSessionHasErrors([
                'seo_google_analytics_id' => 'Google Analytics IDs look like G-XXXXXXXXXX.',
                'seo_google_tag_manager_id' => 'Tag Manager IDs look like GTM-XXXXXXX.',
                'seo_google_verification' => 'Paste only the verification code, not the whole meta tag.',
            ]);
    }

    public function test_requires_a_title_for_every_page(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.seo.update'), $this->validPayload([
                'seo_pages' => [
                    'home' => ['title' => '', 'description' => 'Fine.'],
                    'lots' => ['title' => 'Lots', 'description' => 'Fine.'],
                ],
            ]))
            ->assertSessionHasErrors(['seo_pages.home.title' => 'Every page needs a title.']);
    }
}
