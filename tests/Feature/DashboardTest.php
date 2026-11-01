<?php

namespace Tests\Feature;

use App\Models\ContactEnquiry;
use App\Models\Lot;
use App\Models\SellerSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->actingAs($user = User::factory()->create());

        $this->get('/dashboard')->assertOk();
    }

    public function test_dashboard_shows_activity_counts_and_latest_submissions()
    {
        SellerSubmission::factory()->count(2)->create();
        ContactEnquiry::factory()->create();
        Lot::factory()->create();
        Lot::factory()->sold()->create();

        $this->actingAs(User::factory()->create())
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('stats', ['sellerSubmissions' => 2, 'contactEnquiries' => 1, 'lotsOnAuction' => 1, 'users' => 1])
                ->has('recentSubmissions', 2)
                ->has('recentEnquiries', 1));
    }
}
