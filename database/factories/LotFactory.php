<?php

namespace Database\Factories;

use App\Models\Lot;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Lot>
 */
class LotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->randomElement(['Family home', 'Corner stand', 'Sectional unit', 'Industrial unit', 'Vacant land']).' in '.fake()->city();

        return [
            'web_ref' => (string) fake()->unique()->numberBetween(100000, 999999),
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(5)),
            'title' => $title,
            'summary' => fake()->sentence(16),
            'description' => fake()->paragraphs(3, true),
            'property_type' => fake()->randomElement(['House', 'Townhouse', 'Apartment', 'Vacant land', 'Commercial', 'Industrial']),
            'province' => fake()->randomElement(['Gauteng', 'Mpumalanga', 'Limpopo', 'North West', 'Free State']),
            'city' => fake()->city(),
            'suburb' => fake()->streetName(),
            'address' => fake()->streetAddress(),
            'bedrooms' => fake()->numberBetween(1, 5),
            'bathrooms' => fake()->numberBetween(1, 3),
            'garages' => fake()->numberBetween(0, 3),
            'erf_size' => fake()->numberBetween(250, 2000),
            'floor_size' => fake()->numberBetween(45, 450),
            'opening_bid' => fake()->numberBetween(20, 400) * 5000,
            'monthly_rates' => fake()->numberBetween(300, 3500),
            'monthly_levies' => null,
            'auction_type' => 'online',
            'status' => Lot::STATUS_OPEN,
            'auctioneer' => fake()->name(),
            'bidding_opens_at' => now()->subDays(2),
            'bidding_closes_at' => now()->addDays(fake()->numberBetween(3, 21))->setTime(14, 0),
            'bid_url' => 'https://bidpro.co.za',
            'image_url' => null,
            'features' => fake()->randomElements(['Borehole', 'Solar geyser', 'Pool', 'Fibre ready', 'Electric fence', 'Garden flat', 'Prepaid electricity'], 3),
            'is_featured' => false,
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => ['is_featured' => true]);
    }

    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Lot::STATUS_UPCOMING,
            'bidding_opens_at' => now()->addDays(5),
            'bidding_closes_at' => now()->addDays(12),
        ]);
    }

    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Lot::STATUS_SOLD,
            'bidding_opens_at' => now()->subDays(20),
            'bidding_closes_at' => now()->subDays(10),
        ]);
    }
}
