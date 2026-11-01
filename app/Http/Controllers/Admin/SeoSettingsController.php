<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSeoSettingsRequest;
use App\Support\SiteSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SeoSettingsController extends Controller
{
    public function edit(SiteSettings $settings): Response
    {
        $all = $settings->all();

        return Inertia::render('admin/seo', [
            'settings' => [
                ...Arr::only($all, [
                    'seo_description', 'seo_keywords', 'seo_allow_indexing', 'seo_twitter_handle',
                    'seo_google_verification', 'seo_bing_verification', 'seo_google_analytics_id', 'seo_google_tag_manager_id',
                ]),
                'seo_pages' => $all['seo_pages'],
            ],
            'pages' => SiteSettings::SEO_PAGES,
            'imageUrl' => $settings->seoImageUrl(),
            'hasCustomImage' => filled($all['seo_image']),
            'sitemapUrl' => route('sitemap'),
            'robotsUrl' => route('robots'),
        ]);
    }

    public function update(UpdateSeoSettingsRequest $request, SiteSettings $settings): RedirectResponse
    {
        $validated = Arr::except($request->validated(), ['seo_image', 'remove_seo_image']);
        $currentImage = $settings->get('seo_image');

        if ($request->hasFile('seo_image') || $request->boolean('remove_seo_image')) {
            if ($currentImage) {
                Storage::disk('public')->delete($currentImage);
            }

            $validated['seo_image'] = $request->file('seo_image')?->store('seo', 'public');
        }

        $settings->update([
            ...$validated,
            'seo_allow_indexing' => $request->boolean('seo_allow_indexing'),
        ]);

        return back()->with('success', 'SEO settings saved.');
    }
}
