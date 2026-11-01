<?php

namespace Database\Seeders;

use App\Models\Lot;
use Illuminate\Database\Seeder;

class LotSeeder extends Seeder
{
    /**
     * Seed sample lots for local development. Replace with real stock before launch.
     */
    public function run(): void
    {
        Lot::factory()->featured()->create([
            'web_ref' => '171665',
            'slug' => 'sample-family-home-kempton-park',
            'title' => 'Sample lot: three-bedroom family home, Kempton Park',
            'summary' => 'Placeholder listing used to preview the featured-lot layout. Swap for a real mandate before going live.',
            'property_type' => 'House',
            'province' => 'Gauteng',
            'city' => 'Kempton Park',
            'suburb' => 'Kempton Park Central',
            'bedrooms' => 3,
            'bathrooms' => 2,
            'garages' => 2,
            'opening_bid' => 650000,
            'auctioneer' => 'Caprivi Auctions',
        ]);

        Lot::factory()->count(5)->create();
        Lot::factory()->upcoming()->count(2)->create();
        Lot::factory()->sold()->count(2)->create();
    }
}
