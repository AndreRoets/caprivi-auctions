<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Builds the "seo" page prop that the root Blade view renders server-side
 * (for crawlers and link previews) and the React <Seo> component keeps in sync.
 */
class SeoMeta
{
    public function __construct(private SiteSettings $settings) {}

    /**
     * @return array{title: string, description: string, image: string, url: string, type: string}
     */
    public function forPage(string $page): array
    {
        $pageSettings = $this->settings->get('seo_pages')[$page] ?? [];

        return $this->make(
            $pageSettings['title'] ?? '',
            $pageSettings['description'] ?? null,
        );
    }

    /**
     * @return array{title: string, description: string, image: string, url: string, type: string}
     */
    public function forUpcomingAuctions(): array
    {
        return $this->make(
            'Upcoming property auctions',
            'See every upcoming property auction with Caprivi Auctions. Create a free account and register to bid before the auction opens.',
        );
    }

    /**
     * @param  array<string, mixed>  $auction  a CoreX auction
     * @return array{title: string, description: string, image: string, url: string, type: string}
     */
    public function forAuction(array $auction): array
    {
        return $this->make(
            (string) ($auction['title'] ?? ''),
            $this->plainText($auction['description'] ?? null),
            $this->absoluteUrl($auction['image_url'] ?? null),
        );
    }

    /**
     * @param  array<string, mixed>  $lot  a CoreX lot
     * @return array{title: string, description: string, image: string, url: string, type: string}
     */
    public function forCorexLot(array $lot): array
    {
        $place = implode(', ', array_filter([$lot['suburb'] ?? null, $lot['city'] ?? null]));
        $title = trim(($lot['title'] ?? '').($place ? " – {$place}" : ''));

        return $this->make(
            $title,
            $this->plainText($lot['description'] ?? null),
            $this->absoluteUrl($lot['image_url'] ?? null),
            'article',
        );
    }

    /**
     * @return array{title: string, description: string, image: string, url: string, type: string}
     */
    private function make(string $title, ?string $description, ?string $image = null, string $type = 'website'): array
    {
        return [
            'title' => $title,
            'description' => Str::limit($description ?: (string) $this->settings->get('seo_description'), 300),
            'image' => $image ?? $this->settings->seoImageUrl(),
            'url' => url()->current(),
            'type' => $type,
        ];
    }

    private function plainText(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return Str::squish(strip_tags($value));
    }

    private function absoluteUrl(mixed $url): ?string
    {
        if (! is_string($url) || $url === '') {
            return null;
        }

        return Str::startsWith($url, ['http://', 'https://']) ? $url : asset($url);
    }
}
