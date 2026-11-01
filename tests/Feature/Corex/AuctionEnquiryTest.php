<?php

namespace Tests\Feature\Corex;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\FakesCorex;
use Tests\TestCase;

class AuctionEnquiryTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    public function test_lot_enquiry_is_sent_to_corex_with_consent(): void
    {
        $this->fakeCorex(['/12/lots/34/enquiries' => Http::response(['ok' => true], 201)]);

        $this->from('/auctions/12/lots/34')
            ->post(route('auctions.lots.enquiries.store', [12, 34]), ['name' => 'Bea', 'phone' => '082 000 0000', 'message' => 'Viewing?', 'popia_consent' => '1'])
            ->assertRedirect('/auctions/12/lots/34')
            ->assertSessionHas('success');

        $this->assertCorexSent('POST', '/12/lots/34/enquiries', fn (ClientRequest $request) => $request['popia_consent'] === true
            && $request['phone'] === '082 000 0000'
            && $request['email'] === null);
    }

    public function test_enquiry_needs_an_email_or_phone_and_consent(): void
    {
        $this->fakeCorex();

        $this->post(route('auctions.enquiries.store', 12), ['name' => 'Bea'])
            ->assertSessionHasErrors([
                'email' => 'Enter an email address or a phone number.',
                'popia_consent' => 'Please consent so the agency can contact you.',
            ]);

        Http::assertNothingSent();
    }
}
