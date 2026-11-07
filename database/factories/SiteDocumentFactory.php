<?php

namespace Database\Factories;

use App\Models\SiteDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteDocument>
 */
class SiteDocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'file_path' => 'site-documents/'.fake()->uuid().'.pdf',
            'original_name' => 'conditions-of-sale.pdf',
            'size' => 2048,
            'access' => SiteDocument::ACCESS_EVERYONE,
            'sort_order' => 0,
            'is_published' => true,
        ];
    }

    public function signedInOnly(): static
    {
        return $this->state(['access' => SiteDocument::ACCESS_SIGNED_IN]);
    }

    public function unpublished(): static
    {
        return $this->state(['is_published' => false]);
    }
}
