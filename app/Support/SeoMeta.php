<?php

namespace App\Support;

use App\Models\Lot;
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
    public function forLot(Lot $lot): array
    {
        $image = $lot->image_url ? (Str::startsWith($lot->image_url, ['http://', 'https://']) ? $lot->image_url : asset($lot->image_url)) : null;

        return $this->make($lot->title, $lot->summary, $image, 'article');
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
}
