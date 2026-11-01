<?php

namespace App\Models;

use Database\Factories\LotFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lot extends Model
{
    /** @use HasFactory<LotFactory> */
    use HasFactory;

    public const STATUS_UPCOMING = 'upcoming';

    public const STATUS_OPEN = 'open';

    public const STATUS_CLOSED = 'closed';

    public const STATUS_SOLD = 'sold';

    /**
     * Statuses that are shown on the public "on auction" page.
     *
     * @var list<string>
     */
    public const ACTIVE_STATUSES = [self::STATUS_UPCOMING, self::STATUS_OPEN];

    /**
     * @var list<string>
     */
    public const AUCTION_TYPES = ['online', 'live', 'hybrid', 'tender'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'web_ref',
        'slug',
        'title',
        'summary',
        'description',
        'property_type',
        'province',
        'city',
        'suburb',
        'address',
        'bedrooms',
        'bathrooms',
        'garages',
        'erf_size',
        'floor_size',
        'opening_bid',
        'monthly_rates',
        'monthly_levies',
        'auction_type',
        'status',
        'auctioneer',
        'bidding_opens_at',
        'bidding_closes_at',
        'bid_url',
        'image_url',
        'features',
        'is_featured',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'bidding_opens_at' => 'datetime',
            'bidding_closes_at' => 'datetime',
            'features' => 'array',
            'is_featured' => 'boolean',
            'opening_bid' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @param  Builder<Lot>  $query
     */
    public function scopeOnAuction(Builder $query): void
    {
        $query->whereIn('status', self::ACTIVE_STATUSES);
    }

    /**
     * @return HasMany<ContactEnquiry, $this>
     */
    public function enquiries(): HasMany
    {
        return $this->hasMany(ContactEnquiry::class);
    }
}
