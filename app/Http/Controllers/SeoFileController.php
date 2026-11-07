<?php

namespace App\Http\Controllers;

use App\Support\Corex\CorexClient;
use App\Support\SiteSettings;
use Illuminate\Http\Response;

class SeoFileController extends Controller
{
    public function robots(SiteSettings $settings): Response
    {
        $lines = ['User-agent: *'];

        if ($settings->get('seo_allow_indexing')) {
            array_push($lines, 'Disallow: /dashboard', 'Disallow: /admin', 'Disallow: /settings', 'Disallow: /login', 'Disallow: /forgot-password', 'Disallow: /account');
            $lines[] = '';
            $lines[] = 'Sitemap: '.route('sitemap');
        } else {
            $lines[] = 'Disallow: /';
        }

        return response(implode("\n", $lines)."\n")->header('Content-Type', 'text/plain');
    }

    /**
     * Public pages plus every auction CoreX lists (from the cached auction lists).
     */
    public function sitemap(CorexClient $corex): Response
    {
        $urls = [
            ['loc' => route('home'), 'priority' => '1.0'],
            ['loc' => route('auctions.index'), 'priority' => '0.9'],
            ['loc' => route('auctions.upcoming'), 'priority' => '0.8'],
        ];

        $phases = ['live' => '0.8', 'upcoming' => '0.8'];

        if ($corex->siteOrNull()['site']['show_past_auctions'] ?? false) {
            $phases['finished'] = '0.4';
        }

        foreach ($phases as $phase => $priority) {
            foreach ($corex->auctionsOrEmpty($phase) as $auction) {
                if (isset($auction['id'])) {
                    $urls[] = ['loc' => route('auctions.show', $auction['id']), 'priority' => $priority];
                }
            }
        }

        return response()->view('sitemap', ['urls' => $urls])->header('Content-Type', 'application/xml');
    }
}
