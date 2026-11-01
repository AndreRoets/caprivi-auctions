<?php

namespace Tests\Feature;

use App\Models\ContactEnquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\FakesCorex;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use FakesCorex;
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

    public function test_dashboard_shows_enquiry_counts_and_that_corex_is_not_configured()
    {
        ContactEnquiry::factory()->create();

        $this->actingAs(User::factory()->create())
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('corex.configured', false)
                ->where('corex.connected', false)
                ->where('stats', ['contactEnquiries' => 1, 'users' => 1])
                ->has('recentEnquiries', 1));
    }

    public function test_dashboard_shows_the_corex_connection_and_auction_counts()
    {
        $this->fakeCorex(['?phase=live' => Http::response(['data' => [$this->corexAuction()]])]);

        $this->actingAs(User::factory()->create())
            ->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('corex.connected', true)
                ->where('corex.agencyName', 'Test Agency')
                ->where('corex.liveAuctions', 1)
                ->where('corex.upcomingAuctions', 0)
                ->where('corex.sellFormEnabled', true));
    }
}
