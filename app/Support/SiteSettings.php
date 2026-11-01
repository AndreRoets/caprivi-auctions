<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

/**
 * Editable website settings (contact details and SEO), stored as key/value rows
 * and merged over sensible defaults so the site always has something to show.
 */
class SiteSettings
{
    public const CACHE_KEY = 'site-settings';

    /**
     * Keys exposed to every page through the shared "site" Inertia prop.
     *
     * @var list<string>
     */
    public const CONTACT_KEYS = [
        'company_name', 'tagline', 'legal_name', 'address',
        'main_phone', 'mobile_phone', 'extra_phones', 'whatsapp', 'emails',
        'live_auctions_url', 'parent_site_url',
        'facebook_url', 'instagram_url', 'linkedin_url', 'youtube_url',
    ];

    /**
     * Pages whose title and description can be edited from the SEO screen.
     *
     * @var array<string, string>
     */
    public const SEO_PAGES = [
        'home' => 'Home page',
        'lots' => 'Property on auction',
    ];

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'company_name' => 'Caprivi Auctions',
            'tagline' => 'Smart Bid. Smart Buy.',
            'legal_name' => 'Caprivi Properties (Pty) Ltd t/a Caprivi Auctions & Bids',
            'address' => '70 Commissioner Street, Kempton Park, Gauteng',
            'main_phone' => '010 001 9469',
            'mobile_phone' => '082 348 4595',
            'extra_phones' => ['010 495 6216'],
            'whatsapp' => '068 452 2930',
            'emails' => ['info@capriviauctions.co.za', 'sales@capriviauctions.co.za'],
            'live_auctions_url' => 'https://bidpro.co.za',
            'parent_site_url' => 'https://capriviproperties.co.za',
            'facebook_url' => null,
            'instagram_url' => null,
            'linkedin_url' => null,
            'youtube_url' => null,

            'seo_description' => 'Caprivi Auctions runs online, live, hybrid and sealed-tender property auctions in Gauteng and beyond. Complete the seller questionnaire for a free valuation.',
            'seo_keywords' => 'property auctions, online property auction, sell house at auction, Kempton Park auctioneers, Gauteng property auctions',
            'seo_image' => null,
            'seo_allow_indexing' => true,
            'seo_twitter_handle' => null,
            'seo_google_verification' => null,
            'seo_bing_verification' => null,
            'seo_google_analytics_id' => null,
            'seo_google_tag_manager_id' => null,
            'seo_pages' => [
                'home' => [
                    'title' => 'Sell at auction',
                    'description' => 'Caprivi Auctions runs online, live, hybrid and sealed-tender property auctions. Complete the seller questionnaire for a free valuation.',
                ],
                'lots' => [
                    'title' => 'Property on auction',
                    'description' => 'Browse houses, land and commercial property currently on auction with Caprivi Auctions. Register, view by appointment and bid online.',
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        $stored = Cache::rememberForever(self::CACHE_KEY, fn () => Setting::query()->pluck('value', 'key')->all());

        return array_merge(self::defaults(), Arr::only($stored, array_keys(self::defaults())));
    }

    public function get(string $key): mixed
    {
        return $this->all()[$key] ?? null;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    public function update(array $values): void
    {
        foreach (Arr::only($values, array_keys(self::defaults())) as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<string, mixed>
     */
    public function contact(): array
    {
        return Arr::only($this->all(), self::CONTACT_KEYS);
    }

    /**
     * The phone numbers to list publicly, main number first.
     *
     * @return list<string>
     */
    public function phones(): array
    {
        $settings = $this->all();

        return array_values(array_unique(array_filter([
            $settings['main_phone'],
            $settings['mobile_phone'],
            ...($settings['extra_phones'] ?? []),
        ])));
    }

    public function seoImageUrl(): string
    {
        $path = $this->get('seo_image');

        return asset($path ? 'storage/'.$path : 'images/caprivi-logo.png');
    }
}
