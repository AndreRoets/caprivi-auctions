<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSellerSubmissionRequest;
use App\Models\SellerSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;

class SellerSubmissionController extends Controller
{
    public function store(StoreSellerSubmissionRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        SellerSubmission::create([
            ...Arr::only($validated, [
                'seller_type', 'name', 'email', 'phone', 'preferred_contact',
                'property_type', 'address', 'suburb', 'price_expectation', 'auction_platform',
            ]),
            'answers' => Arr::except($validated, ['website']),
            'marketing_opt_in' => (bool) ($validated['marketing_opt_in'] ?? false),
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Thank you. An auctioneer will contact you within one business day.');
    }
}
