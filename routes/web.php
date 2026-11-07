<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SeoSettingsController;
use App\Http\Controllers\Admin\SiteDocumentController as AdminSiteDocumentController;
use App\Http\Controllers\Admin\SiteSettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuctionController;
use App\Http\Controllers\AuctionEnquiryController;
use App\Http\Controllers\BidderRegistrationController;
use App\Http\Controllers\BiddingController;
use App\Http\Controllers\BuyerAccountController;
use App\Http\Controllers\BuyerAuthController;
use App\Http\Controllers\ContactEnquiryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SellAtAuctionController;
use App\Http\Controllers\SeoFileController;
use App\Http\Controllers\SiteDocumentController;
use App\Http\Middleware\EnsureBuyerIsLoggedIn;
use App\Http\Middleware\RedirectIfBuyerIsLoggedIn;
use Illuminate\Support\Facades\Route;

// CoreX ids are interpolated into API paths, so only allow plain identifiers.
Route::pattern('auction', '[A-Za-z0-9_-]+');
Route::pattern('lot', '[A-Za-z0-9_-]+');
Route::pattern('document', '[A-Za-z0-9_-]+');
Route::pattern('invoice', '[A-Za-z0-9_-]+');

Route::get('/', HomeController::class)->name('home');

Route::get('robots.txt', [SeoFileController::class, 'robots'])->name('robots');
Route::get('sitemap.xml', [SeoFileController::class, 'sitemap'])->name('sitemap');

Route::get('documents/{siteDocument}', SiteDocumentController::class)->name('site-documents.download');

Route::permanentRedirect('on-auction', '/auctions');

Route::prefix('auctions')->name('auctions.')->group(function () {
    Route::get('/', [AuctionController::class, 'index'])->name('index');
    Route::get('upcoming', [AuctionController::class, 'upcoming'])->name('upcoming');
    Route::get('{auction}', [AuctionController::class, 'show'])->name('show');
    Route::get('{auction}/lots/{lot}', [AuctionController::class, 'lot'])->name('lots.show');
    Route::get('{auction}/lots/{lot}/feed', [AuctionController::class, 'feed'])->middleware('throttle:120,1')->name('lots.feed');
    Route::get('{auction}/documents/{document}', [AuctionController::class, 'auctionDocument'])->name('documents.show');
    Route::get('{auction}/lots/{lot}/documents/{document}', [AuctionController::class, 'lotDocument'])->name('lots.documents.show');

    Route::middleware('throttle:6,1')->group(function () {
        Route::post('{auction}/enquiries', [AuctionEnquiryController::class, 'auction'])->name('enquiries.store');
        Route::post('{auction}/lots/{lot}/enquiries', [AuctionEnquiryController::class, 'lot'])->name('lots.enquiries.store');
    });

    Route::middleware(EnsureBuyerIsLoggedIn::class)->group(function () {
        Route::get('{auction}/register', [BidderRegistrationController::class, 'create'])->name('register');
        Route::post('{auction}/register', [BidderRegistrationController::class, 'store'])->middleware('throttle:6,1')->name('register.store');
    });
});

Route::prefix('lots/{lot}')->name('lots.')->middleware([EnsureBuyerIsLoggedIn::class, 'throttle:30,1'])->group(function () {
    Route::post('bids', [BiddingController::class, 'bid'])->name('bids.store');
    Route::post('auto-bid', [BiddingController::class, 'setAutoBid'])->name('auto-bid.store');
    Route::delete('auto-bid', [BiddingController::class, 'cancelAutoBid'])->name('auto-bid.destroy');
    Route::post('watch', [BiddingController::class, 'watch'])->name('watch');
});

Route::prefix('account')->name('buyer.')->group(function () {
    Route::middleware(RedirectIfBuyerIsLoggedIn::class)->group(function () {
        Route::get('login', [BuyerAuthController::class, 'showLogin'])->name('login');
        Route::get('signup', [BuyerAuthController::class, 'showSignup'])->name('signup');
        Route::get('forgot-password', [BuyerAuthController::class, 'showForgot'])->name('forgot');

        Route::middleware('throttle:10,1')->group(function () {
            Route::post('login', [BuyerAuthController::class, 'login'])->name('login.store');
            Route::post('signup/send', [BuyerAuthController::class, 'sendSignupCode'])->name('signup.send');
            Route::post('signup/verify', [BuyerAuthController::class, 'verifySignup'])->name('signup.verify');
            Route::post('forgot-password/send', [BuyerAuthController::class, 'sendResetCode'])->name('forgot.send');
            Route::post('forgot-password/reset', [BuyerAuthController::class, 'resetPassword'])->name('forgot.reset');
        });
    });

    Route::post('logout', [BuyerAuthController::class, 'logout'])->name('logout');

    Route::middleware(EnsureBuyerIsLoggedIn::class)->group(function () {
        Route::get('/', [BuyerAccountController::class, 'show'])->name('account');
        Route::put('/', [BuyerAccountController::class, 'update'])->name('account.update');
        Route::get('invoices/{invoice}/pdf', [BuyerAccountController::class, 'invoicePdf'])->name('invoices.pdf');
    });
});

Route::middleware('throttle:6,1')->group(function () {
    Route::post('seller-questionnaire', [SellAtAuctionController::class, 'store'])->name('seller-questionnaire.store');
    Route::post('contact', [ContactEnquiryController::class, 'store'])->name('contact-enquiries.store');
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('users', UserController::class)->except('show');

        Route::get('site-settings', [SiteSettingsController::class, 'edit'])->name('site-settings.edit');
        Route::put('site-settings', [SiteSettingsController::class, 'update'])->name('site-settings.update');

        Route::resource('documents', AdminSiteDocumentController::class)->except('show')->parameters(['documents' => 'siteDocument']);

        Route::get('seo', [SeoSettingsController::class, 'edit'])->name('seo.edit');
        Route::post('seo', [SeoSettingsController::class, 'update'])->name('seo.update');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
