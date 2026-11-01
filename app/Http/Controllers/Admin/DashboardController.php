<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactEnquiry;
use App\Models\User;
use App\Support\Corex\CorexClient;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(CorexClient $corex): Response
    {
        $site = $corex->siteOrNull();

        return Inertia::render('dashboard', [
            'corex' => [
                'configured' => $corex->isConfigured(),
                'connected' => $site !== null,
                'agencyName' => $site['agency']['name'] ?? null,
                'liveAuctions' => $site ? count($corex->auctionsOrEmpty('live')) : null,
                'upcomingAuctions' => $site ? count($corex->auctionsOrEmpty('upcoming')) : null,
                'sellFormEnabled' => (bool) ($site['features']['seller_questionnaire'] ?? false),
            ],
            'stats' => [
                'contactEnquiries' => ContactEnquiry::query()->count(),
                'users' => User::query()->count(),
            ],
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
