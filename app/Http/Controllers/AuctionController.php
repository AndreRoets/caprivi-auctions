<?php

namespace App\Http\Controllers;

use App\Support\Corex\CorexClient;
use App\Support\Corex\CorexException;
use App\Support\SeoMeta;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Public auction pages. Everything is read from CoreX; nothing is stored locally.
 */
class AuctionController extends Controller
{
    public function __construct(private CorexClient $corex) {}

    public function index(SeoMeta $seo): Response
    {
        $site = $this->corex->siteOrNull();

        return Inertia::render('auctions/index', [
            'corexSite' => $site,
            'liveAuctions' => $site ? $this->corex->auctionsOrEmpty('live') : [],
            'upcomingAuctions' => $site ? $this->corex->auctionsOrEmpty('upcoming') : [],
            'pastAuctions' => ($site['site']['show_past_auctions'] ?? false) ? $this->corex->auctionsOrEmpty('finished') : [],
            'seo' => $seo->forPage('auctions'),
        ]);
    }

    public function upcoming(SeoMeta $seo): Response
    {
        $site = $this->corex->siteOrNull();

        return Inertia::render('auctions/upcoming', [
            'corexSite' => $site,
            'upcomingAuctions' => $site ? $this->corex->auctionsOrEmpty('upcoming') : [],
            'seo' => $seo->forUpcomingAuctions(),
        ]);
    }

    public function show(string $auction, SeoMeta $seo): Response
    {
        $data = $this->corex->get("/{$auction}")['data'] ?? [];

        return Inertia::render('auctions/show', [
            'auction' => $data,
            'seo' => $seo->forAuction($data),
        ]);
    }

    public function lot(string $auction, string $lot, SeoMeta $seo): Response
    {
        $data = $this->corex->get("/{$auction}/lots/{$lot}")['data'] ?? [];

        return Inertia::render('auctions/lot', [
            'lot' => $data,
            'auctionId' => $auction,
            'seo' => $seo->forCorexLot($data),
        ]);
    }

    /**
     * The live part of a lot page, polled every few seconds while the visitor watches it.
     */
    public function feed(string $auction, string $lot): JsonResponse
    {
        try {
            $data = $this->corex->get("/{$auction}/lots/{$lot}/feed")['data'] ?? [];
        } catch (CorexException $exception) {
            if ($exception->errorCode === CorexException::LOGIN_REQUIRED) {
                throw $exception;
            }

            return response()->json(['message' => $exception->getMessage()], $exception->status);
        }

        return response()->json(['data' => $data])->header('Cache-Control', 'private, no-store');
    }

    public function auctionDocument(string $auction, string $document): StreamedResponse
    {
        return $this->corex->download("/{$auction}/documents/{$document}");
    }

    public function lotDocument(string $auction, string $lot, string $document): StreamedResponse
    {
        return $this->corex->download("/{$auction}/lots/{$lot}/documents/{$document}");
    }
}
