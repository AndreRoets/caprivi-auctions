<?php

namespace App\Http\Controllers;

use App\Models\SiteDocument;
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
            'corexError' => $corex->lastError(),
            'documents' => SiteDocument::query()->published()->ordered()->get()->map(fn (SiteDocument $document) => [
                'id' => $document->id,
                'title' => $document->title,
                'description' => $document->description,
                'type' => $document->extension(),
                'size' => $document->size,
                'requires_login' => $document->requiresLogin(),
                'download_url' => route('site-documents.download', $document),
            ])->all(),
            'seo' => $seo->forPage('home'),
        ]);
    }
}
