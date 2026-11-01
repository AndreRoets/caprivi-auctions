<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SeoSettingsController;
use App\Http\Controllers\Admin\SiteSettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ContactEnquiryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LotController;
use App\Http\Controllers\SellerSubmissionController;
use App\Http\Controllers\SeoFileController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('on-auction', [LotController::class, 'index'])->name('lots.index');
Route::get('lots/{lot}', [LotController::class, 'show'])->name('lots.show');

Route::get('robots.txt', [SeoFileController::class, 'robots'])->name('robots');
Route::get('sitemap.xml', [SeoFileController::class, 'sitemap'])->name('sitemap');

Route::middleware('throttle:6,1')->group(function () {
    Route::post('seller-questionnaire', [SellerSubmissionController::class, 'store'])->name('seller-submissions.store');
    Route::post('contact', [ContactEnquiryController::class, 'store'])->name('contact-enquiries.store');
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class)->except('show');

        Route::get('site-settings', [SiteSettingsController::class, 'edit'])->name('site-settings.edit');
        Route::put('site-settings', [SiteSettingsController::class, 'update'])->name('site-settings.update');

        Route::get('seo', [SeoSettingsController::class, 'edit'])->name('seo.edit');
        Route::post('seo', [SeoSettingsController::class, 'update'])->name('seo.update');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
