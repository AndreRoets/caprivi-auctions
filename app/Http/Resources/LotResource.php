<?php

namespace App\Http\Resources;

use App\Models\Lot;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Lot
 */
class LotResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'web_ref' => $this->web_ref,
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'description' => $this->description,
            'property_type' => $this->property_type,
            'province' => $this->province,
            'city' => $this->city,
            'suburb' => $this->suburb,
            'address' => $this->address,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'garages' => $this->garages,
            'erf_size' => $this->erf_size,
            'floor_size' => $this->floor_size,
            'opening_bid' => $this->opening_bid,
            'monthly_rates' => $this->monthly_rates,
            'monthly_levies' => $this->monthly_levies,
            'auction_type' => $this->auction_type,
            'status' => $this->status,
            'auctioneer' => $this->auctioneer,
            'bidding_opens_at' => $this->bidding_opens_at?->toIso8601String(),
            'bidding_closes_at' => $this->bidding_closes_at?->toIso8601String(),
            'bid_url' => $this->bid_url,
            'image_url' => $this->image_url,
            'features' => $this->features ?? [],
        ];
    }
}
