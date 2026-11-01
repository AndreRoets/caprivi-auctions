<?php

namespace App\Http\Controllers;

use App\Support\Corex\CorexClient;
use App\Support\SeoMeta;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(CorexClient $corex, SeoMeta $seo): Response
    {
        $site = $corex->siteOrNull();

        return Inertia::render('welcome', [
            'corexSite' => $site,
            'liveAuctions' => $site ? array_slice($corex->auctionsOrEmpty('live'), 0, 3) : [],
            'upcomingAuctions' => $site ? array_slice($corex->auctionsOrEmpty('upcoming'), 0, 3) : [],
            'seo' => $seo->forPage('home'),
        ]);
    }
}
