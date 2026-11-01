<?php

namespace Tests\Feature;

use App\Models\ContactEnquiry;
use App\Models\Lot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactEnquiryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'name' => 'Thandi Mokoena',
            'phone' => '0821234567',
            'email' => 'thandi@example.com',
            'subject' => ContactEnquiry::SUBJECTS[0],
            'message' => 'I would like to sell my house on auction.',
            ...$overrides,
        ];
    }

    public function test_enquiry_is_stored(): void
    {
        $this->from(route('home'))
            ->post(route('contact-enquiries.store'), $this->validPayload())
            ->assertRedirect(route('home'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('contact_enquiries', ['email' => 'thandi@example.com', 'lot_id' => null]);
    }

    public function test_enquiry_can_reference_a_lot(): void
    {
        $lot = Lot::factory()->create();

        $this->post(route('contact-enquiries.store'), $this->validPayload(['lot_id' => $lot->id]));

        $this->assertDatabaseHas('contact_enquiries', ['lot_id' => $lot->id]);
    }

    public function test_required_fields_are_validated(): void
    {
        $this->post(route('contact-enquiries.store'), [])
            ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);

        $this->assertDatabaseCount('contact_enquiries', 0);
    }

    public function test_unknown_subject_and_lot_are_rejected(): void
    {
        $this->post(route('contact-enquiries.store'), $this->validPayload(['subject' => 'Spam', 'lot_id' => 999]))
            ->assertSessionHasErrors(['subject', 'lot_id']);
    }

    public function test_honeypot_blocks_bots(): void
    {
        $this->post(route('contact-enquiries.store'), $this->validPayload(['website' => 'http://spam.test']))
            ->assertSessionHasErrors('website');

        $this->assertDatabaseCount('contact_enquiries', 0);
    }

    public function test_submissions_are_rate_limited(): void
    {
        foreach (range(1, 6) as $attempt) {
            $this->post(route('contact-enquiries.store'), $this->validPayload());
        }

        $this->post(route('contact-enquiries.store'), $this->validPayload())->assertTooManyRequests();
    }
}
