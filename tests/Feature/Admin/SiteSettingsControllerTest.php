<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SiteSettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'company_name' => 'Caprivi Auctions',
            'tagline' => 'Smart Bid. Smart Buy.',
            'legal_name' => 'Caprivi Properties (Pty) Ltd',
            'address' => '1 Main Road, Kempton Park',
            'main_phone' => '011 222 3333',
            'mobile_phone' => '082 000 1111',
            'extra_phones' => ['010 999 8888'],
            'whatsapp' => '068 452 2930',
            'emails' => ['hello@capriviauctions.co.za'],
            'live_auctions_url' => 'https://bidpro.co.za',
            'parent_site_url' => null,
            'facebook_url' => 'https://facebook.com/capriviauctions',
            'instagram_url' => null,
            'linkedin_url' => null,
            'youtube_url' => null,
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('admin.site-settings.edit'))->assertRedirect(route('login'));
        $this->put(route('admin.site-settings.update'), $this->validPayload())->assertRedirect(route('login'));
    }

    public function test_saved_details_are_shared_with_the_public_website(): void
    {
        $this->actingAs(User::factory()->create())
            ->put(route('admin.site-settings.update'), $this->validPayload())
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('site.main_phone', '011 222 3333')
                ->where('site.phones', ['011 222 3333', '082 000 1111', '010 999 8888'])
                ->where('site.emails', ['hello@capriviauctions.co.za'])
                ->where('site.facebook_url', 'https://facebook.com/capriviauctions'));
    }

    public function test_public_website_falls_back_to_default_details(): void
    {
        $this->get(route('home'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('site.company_name', 'Caprivi Auctions')
                ->where('site.main_phone', '010 001 9469'));
    }

    public function test_rejects_invalid_phone_numbers_and_emails(): void
    {
        $this->actingAs(User::factory()->create())
            ->put(route('admin.site-settings.update'), $this->validPayload([
                'main_phone' => 'call us',
                'emails' => ['not-an-email'],
            ]))
            ->assertSessionHasErrors([
                'main_phone' => 'Enter a valid phone number, e.g. 010 001 9469.',
                'emails.0' => 'Each email address must be valid.',
            ]);
    }

    public function test_requires_at_least_one_email(): void
    {
        $this->actingAs(User::factory()->create())
            ->put(route('admin.site-settings.update'), $this->validPayload(['emails' => []]))
            ->assertSessionHasErrors(['emails' => 'Add at least one email address.']);
    }
}
