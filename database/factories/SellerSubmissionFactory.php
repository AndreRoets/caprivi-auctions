<?php

namespace Database\Factories;

use App\Models\SellerSubmission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SellerSubmission>
 */
class SellerSubmissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'seller_type' => 'individual',
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->numerify('08########'),
            'preferred_contact' => 'phone',
            'property_type' => 'House',
            'address' => fake()->streetAddress(),
            'suburb' => 'Kempton Park',
            'price_expectation' => 1500000,
            'auction_platform' => 'online',
            'answers' => [],
            'marketing_opt_in' => false,
            'ip_address' => fake()->ipv4(),
        ];
    }
}
