<?php

namespace App\Models;

use Database\Factories\SellerSubmissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerSubmission extends Model
{
    /** @use HasFactory<SellerSubmissionFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'seller_type',
        'name',
        'email',
        'phone',
        'preferred_contact',
        'property_type',
        'address',
        'suburb',
        'price_expectation',
        'auction_platform',
        'answers',
        'marketing_opt_in',
        'ip_address',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'marketing_opt_in' => 'boolean',
            'price_expectation' => 'integer',
        ];
    }
}
