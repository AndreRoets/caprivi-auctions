<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactEnquiry;
use App\Models\Lot;
use App\Models\SellerSubmission;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'sellerSubmissions' => SellerSubmission::query()->count(),
                'contactEnquiries' => ContactEnquiry::query()->count(),
                'lotsOnAuction' => Lot::query()->onAuction()->count(),
                'users' => User::query()->count(),
            ],
            'recentSubmissions' => SellerSubmission::query()
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'phone', 'property_type', 'suburb', 'created_at'])
                ->map(fn (SellerSubmission $submission) => [
                    ...$submission->only(['id', 'name', 'phone', 'property_type', 'suburb']),
                    'created_at' => $submission->created_at?->toIso8601String(),
                ]),
            'recentEnquiries' => ContactEnquiry::query()
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'phone', 'subject', 'created_at'])
                ->map(fn (ContactEnquiry $enquiry) => [
                    ...$enquiry->only(['id', 'name', 'phone', 'subject']),
                    'created_at' => $enquiry->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
