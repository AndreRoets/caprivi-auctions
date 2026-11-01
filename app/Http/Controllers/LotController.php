<?php

namespace App\Http\Controllers;

use App\Http\Resources\LotResource;
use App\Models\ContactEnquiry;
use App\Models\Lot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LotController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'province' => ['nullable', 'string', 'max:60'],
            'type' => ['nullable', 'string', 'max:60'],
        ]);

        $lots = Lot::query()
            ->onAuction()
            ->when($filters['province'] ?? null, fn ($query, string $province) => $query->where('province', $province))
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('property_type', $type))
            ->orderBy('bidding_closes_at')
            ->get();

        return Inertia::render('lots/index', [
            'lots' => LotResource::collection($lots)->resolve(),
            'filters' => [
                'province' => $filters['province'] ?? '',
                'type' => $filters['type'] ?? '',
            ],
            'provinces' => Lot::query()->onAuction()->distinct()->orderBy('province')->pluck('province'),
            'propertyTypes' => Lot::query()->onAuction()->distinct()->orderBy('property_type')->pluck('property_type'),
            'contactSubjects' => ContactEnquiry::SUBJECTS,
        ]);
    }

    public function show(Lot $lot): Response
    {
        return Inertia::render('lots/show', [
            'lot' => LotResource::make($lot)->resolve(),
            'contactSubjects' => ContactEnquiry::SUBJECTS,
        ]);
    }
}
