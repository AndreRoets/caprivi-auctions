<?php

namespace App\Models;

use Database\Factories\ContactEnquiryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactEnquiry extends Model
{
    /** @use HasFactory<ContactEnquiryFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    public const SUBJECTS = [
        'Selling my property on auction',
        'Buying or bidding on a lot',
        'Booking a viewing',
        'Auction documents',
        'Something else',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'email',
        'subject',
        'message',
    ];
}
