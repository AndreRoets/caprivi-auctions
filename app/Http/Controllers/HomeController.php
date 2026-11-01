<?php

namespace App\Http\Controllers;

use App\Http\Resources\LotResource;
use App\Models\ContactEnquiry;
use App\Models\Lot;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $featuredLot = Lot::query()
            ->onAuction()
            ->orderByDesc('is_featured')
            ->orderBy('bidding_closes_at')
            ->first();

        return Inertia::render('welcome', [
            'featuredLot' => $featuredLot ? LotResource::make($featuredLot)->resolve() : null,
            'contactSubjects' => ContactEnquiry::SUBJECTS,
        ]);
    }
}
