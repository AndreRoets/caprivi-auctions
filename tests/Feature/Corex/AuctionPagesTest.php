<?php

namespace Tests\Feature\Corex;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\FakesCorex;
use Tests\TestCase;

class AuctionPagesTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    public function test_index_lists_live_and_upcoming_auctions_but_not_past_ones_by_default(): void
    {
        $this->fakeCorex([
            '?phase=live' => Http::response(['data' => [$this->corexAuction()]]),
            '?phase=upcoming' => Http::response(['data' => [$this->corexAuction(['id' => 13, 'phase' => 'upcoming'])]]),
        ]);

        $this->get(route('auctions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auctions/index')
                ->where('corexSite.site.title', 'Bid on property online')
                ->has('liveAuctions', 1)
                ->has('upcomingAuctions', 1)
                ->where('pastAuctions', []));

        Http::assertNotSent(fn (ClientRequest $request) => str_contains($request->url(), 'phase=finished'));
    }

    public function test_upcoming_page_lists_only_upcoming_auctions(): void
    {
        $this->fakeCorex([
            '?phase=upcoming' => Http::response(['data' => [$this->corexAuction(['id' => 13, 'phase' => 'upcoming'])]]),
        ]);

        $this->get(route('auctions.upcoming'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auctions/upcoming')
                ->has('upcomingAuctions', 1)
                ->where('upcomingAuctions.0.id', 13));

        Http::assertNotSent(fn (ClientRequest $request) => str_contains($request->url(), 'phase=live'));
    }

    public function test_upcoming_page_renders_when_corex_is_not_configured(): void
    {
        Http::fake();

        $this->get(route('auctions.upcoming'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('corexSite', null)->where('upcomingAuctions', []));
    }

    public function test_index_includes_past_auctions_when_the_agency_shows_them(): void
    {
        $this->fakeCorex(['?phase=finished' => Http::response(['data' => [$this->corexAuction(['id' => 9, 'phase' => 'finished'])]])], ['site' => ['show_past_auctions' => true]]);

        $this->get(route('auctions.index'))->assertInertia(fn (Assert $page) => $page->where('pastAuctions.0.id', 9));
    }

    public function test_old_on_auction_link_redirects_to_auctions(): void
    {
        $this->get('/on-auction')->assertRedirect('/auctions')->assertStatus(301);
    }

    public function test_auction_page_renders_corex_auction_with_its_seo(): void
    {
        $this->fakeCorex(['/12' => Http::response(['data' => [...$this->corexAuction(), 'description' => 'Ten homes on offer.', 'lots' => [$this->corexLot()]]])]);

        $this->get(route('auctions.show', 12))
            ->assertOk()
            ->assertSee('<title inertia>November property auction - Caprivi Auctions</title>', false)
            ->assertInertia(fn (Assert $page) => $page
                ->component('auctions/show')
                ->where('auction.lots.0.id', 34)
                ->where('seo.description', 'Ten homes on offer.'));
    }

    public function test_unknown_auction_is_404(): void
    {
        $this->fakeCorex(['/999' => Http::response(['message' => 'Not found'], 404)]);

        $this->get(route('auctions.show', 999))->assertNotFound();
    }

    public function test_auction_ids_are_restricted_so_they_cannot_reach_other_api_paths(): void
    {
        $this->fakeCorex();

        $this->get('/auctions/..%2Fbuyers%2Fme')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_lot_page_sends_the_buyer_token_to_personalise_it(): void
    {
        $this->fakeCorex(['/12/lots/34' => Http::response(['data' => $this->corexLot()])]);

        $this->actingAsBuyer('cxb_abc')
            ->get(route('auctions.lots.show', [12, 34]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auctions/lot')
                ->where('lot.bidding.min_next', 270000)
                ->where('seo.title', 'Three-bedroom home – Waterkloof, Pretoria'));

        $this->assertCorexSent('GET', '/12/lots/34', fn (ClientRequest $request) => $request->hasHeader('X-Buyer-Token', 'cxb_abc'));
    }

    public function test_page_props_never_contain_the_buyer_token(): void
    {
        $this->fakeCorex(['/12/lots/34' => Http::response(['data' => $this->corexLot()])]);

        $this->actingAsBuyer('cxb_secret_token')
            ->get(route('auctions.lots.show', [12, 34]))
            ->assertDontSee('cxb_secret_token')
            ->assertInertia(fn (Assert $page) => $page->where('buyer.email', 'buyer@example.com'));
    }

    public function test_feed_returns_live_state_without_caching(): void
    {
        $this->fakeCorex(['/12/lots/34/feed' => Http::response(['data' => ['bidding' => $this->corexBidding(), 'my_registration' => null, 'watching' => false]])]);

        $this->getJson(route('auctions.lots.feed', [12, 34]))
            ->assertOk()
            ->assertJsonPath('data.bidding.min_next', 270000)
            ->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_feed_tells_the_browser_to_log_in_again_when_the_token_expired(): void
    {
        $this->fakeCorex(['/12/lots/34/feed' => Http::response(['message' => 'Expired', 'code' => 'buyer_token_invalid'], 401)]);

        $this->actingAsBuyer()
            ->getJson(route('auctions.lots.feed', [12, 34]))
            ->assertUnauthorized()
            ->assertJsonPath('code', 'login_required')
            ->assertSessionMissing('corex.buyer_token');
    }

    public function test_documents_are_streamed_through_this_server(): void
    {
        $this->fakeCorex(['/12/documents/5' => Http::response('%PDF-1.4 test', 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="conditions.pdf"',
        ])]);

        $response = $this->get(route('auctions.documents.show', [12, 5]));

        $response->assertOk()->assertHeader('Content-Type', 'application/pdf')->assertHeader('Content-Disposition', 'attachment; filename="conditions.pdf"');
        $this->assertSame('%PDF-1.4 test', $response->streamedContent());
    }
}
