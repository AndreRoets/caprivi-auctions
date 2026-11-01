<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSiteSettingsRequest;
use App\Support\SiteSettings;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingsController extends Controller
{
    public function edit(SiteSettings $settings): Response
    {
        return Inertia::render('admin/site-settings', [
            'settings' => $settings->contact(),
        ]);
    }

    public function update(UpdateSiteSettingsRequest $request, SiteSettings $settings): RedirectResponse
    {
        $settings->update($request->validated());

        return back()->with('success', 'Website details saved.');
    }
}
