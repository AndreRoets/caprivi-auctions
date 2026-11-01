<?php

namespace Tests\Feature;

use App\Models\SellerSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SellerSubmissionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'seller_type' => 'individual',
            'name' => 'Pieter van Wyk',
            'email' => 'pieter@example.com',
            'phone' => '0831234567',
            'preferred_contact' => 'whatsapp',
            'property_type' => 'House',
            'address' => '12 Example Road',
            'suburb' => 'Kempton Park',
            'bedrooms' => 3,
            'features' => ['Pool'],
            'occupancy' => 'owner',
            'condition' => 'good',
            'has_bond' => false,
            'price_expectation' => 1450000,
            'auction_platform' => 'online',
            'wants_reserve' => true,
            'timing' => 'asap',
            'viewing_access' => 'by_appointment',
            'documents' => ['Title deed copy'],
            'accepts_terms' => true,
            'confirms_authority' => true,
            'consents_to_processing' => true,
            'marketing_opt_in' => true,
            ...$overrides,
        ];
    }

    public function test_questionnaire_is_stored(): void
    {
        $this->from(route('home'))
            ->post(route('seller-submissions.store'), $this->validPayload())
            ->assertRedirect(route('home'))
            ->assertSessionHas('success');

        $submission = SellerSubmission::sole();
        $this->assertSame('pieter@example.com', $submission->email);
        $this->assertSame(1450000, $submission->price_expectation);
        $this->assertTrue($submission->marketing_opt_in);
        $this->assertSame(['Pool'], $submission->answers['features']);
    }

    public function test_consents_are_required(): void
    {
        $this->post(route('seller-submissions.store'), $this->validPayload([
            'accepts_terms' => false,
            'confirms_authority' => false,
            'consents_to_processing' => false,
        ]))->assertSessionHasErrors(['accepts_terms', 'confirms_authority', 'consents_to_processing']);

        $this->assertDatabaseCount('seller_submissions', 0);
    }

    public function test_conditional_fields_are_required_when_relevant(): void
    {
        $this->post(route('seller-submissions.store'), $this->validPayload([
            'seller_type' => 'married_in_community',
            'occupancy' => 'tenant',
            'has_bond' => true,
        ]))->assertSessionHasErrors(['spouse_name', 'monthly_rent', 'bond_bank']);
    }

    public function test_conditional_fields_are_optional_otherwise(): void
    {
        $this->post(route('seller-submissions.store'), $this->validPayload())
            ->assertSessionDoesntHaveErrors();
    }

    public function test_invalid_choices_are_rejected(): void
    {
        $this->post(route('seller-submissions.store'), $this->validPayload([
            'property_type' => 'Castle',
            'auction_platform' => 'carrier-pigeon',
        ]))->assertSessionHasErrors(['property_type', 'auction_platform']);
    }

    public function test_honeypot_blocks_bots(): void
    {
        $this->post(route('seller-submissions.store'), $this->validPayload(['website' => 'filled']))
            ->assertSessionHasErrors('website');

        $this->assertDatabaseCount('seller_submissions', 0);
    }
}
