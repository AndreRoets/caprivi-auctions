<?php

namespace Tests\Feature\Corex;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\FakesCorex;
use Tests\TestCase;

class BidderRegistrationTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    public function test_register_page_requires_login(): void
    {
        $this->get(route('auctions.register', 12))->assertRedirect(route('buyer.login', ['return' => '/auctions/12/register']));
    }

    public function test_register_page_shows_required_documents_and_files_on_record(): void
    {
        $this->fakeCorex([
            '/12' => Http::response(['data' => [...$this->corexAuction(), 'lots' => []]]),
            '/12/registration' => Http::response(['data' => [
                'open' => true, 'closes_at' => null, 'registration' => null,
                'required_documents' => ['individual' => [['kind' => 'id_copy', 'label' => 'ID copy']], 'company' => []],
                'on_file' => ['id_copy' => [['id' => 51, 'name' => 'id.pdf', 'uploaded_at' => '2026-10-01T10:00:00+02:00']]],
                'conditions_text' => 'Conditions of sale…', 'fee_notice' => null,
            ]]),
        ]);

        $this->actingAsBuyer()
            ->get(route('auctions.register', 12))
            ->assertInertia(fn (Assert $page) => $page
                ->component('auctions/register')
                ->where('registration.required_documents.individual.0.kind', 'id_copy')
                ->where('registration.on_file.id_copy.0.id', 51));
    }

    public function test_registration_is_sent_as_multipart_with_new_and_existing_documents(): void
    {
        $this->fakeCorex(['/12/registration' => Http::response(['ok' => true, 'data' => ['id' => 3, 'status' => 'pending']], 201)]);

        $this->actingAsBuyer()
            ->post(route('auctions.register.store', 12), [
                'bidder_type' => 'individual',
                'accept_conditions' => '1',
                'documents' => ['proof_of_address' => UploadedFile::fake()->create('address.pdf', 50, 'application/pdf')],
                'existing' => ['id_copy' => '51'],
            ])
            ->assertRedirect(route('auctions.show', 12))
            ->assertSessionHas('success');

        $this->assertCorexSent('POST', '/12/registration', function (ClientRequest $request) {
            $parts = collect($request->data())->keyBy('name');

            return $request->isMultipart()
                && $parts->has('documents[proof_of_address]')
                && $parts->get('existing[id_copy]')['contents'] === '51'
                && $parts->get('accept_conditions')['contents'] === '1'
                && $parts->get('bidder_type')['contents'] === 'individual';
        });
    }

    public function test_conditions_must_be_accepted_and_files_must_be_documents(): void
    {
        $this->fakeCorex();

        $this->actingAsBuyer()
            ->post(route('auctions.register.store', 12), [
                'bidder_type' => 'individual',
                'documents' => ['id_copy' => UploadedFile::fake()->create('virus.exe', 10, 'application/octet-stream')],
            ])
            ->assertSessionHasErrors([
                'accept_conditions' => 'Please accept the conditions of sale to register.',
                'documents.id_copy' => 'Upload a PDF, JPG or PNG file.',
            ]);
    }
}
