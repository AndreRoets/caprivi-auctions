<?php

namespace App\Http\Controllers;

use App\Models\Lot;
use App\Support\SiteSettings;
use Illuminate\Http\Response;

class SeoFileController extends Controller
{
    public function robots(SiteSettings $settings): Response
    {
        $lines = ['User-agent: *'];

        if ($settings->get('seo_allow_indexing')) {
            array_push($lines, 'Disallow: /dashboard', 'Disallow: /admin', 'Disallow: /settings', 'Disallow: /login', 'Disallow: /forgot-password');
            $lines[] = '';
            $lines[] = 'Sitemap: '.route('sitemap');
        } else {
            $lines[] = 'Disallow: /';
        }

        return response(implode("\n", $lines)."\n")->header('Content-Type', 'text/plain');
    }

    public function sitemap(): Response
    {
        $urls = [
            ['loc' => route('home'), 'lastmod' => null, 'priority' => '1.0'],
            ['loc' => route('lots.index'), 'lastmod' => Lot::query()->onAuction()->max('updated_at'), 'priority' => '0.9'],
        ];

        Lot::query()->select(['slug', 'status', 'updated_at'])->orderByDesc('updated_at')->each(function (Lot $lot) use (&$urls) {
            $urls[] = [
                'loc' => route('lots.show', $lot),
                'lastmod' => $lot->updated_at,
                'priority' => in_array($lot->status, Lot::ACTIVE_STATUSES, true) ? '0.8' : '0.4',
            ];
        });

        return response()->view('sitemap', ['urls' => $urls])->header('Content-Type', 'application/xml');
    }
}
