<?php

use App\Http\Controllers\ContactEnquiryController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LotController;
use App\Http\Controllers\SellerSubmissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');
Route::get('on-auction', [LotController::class, 'index'])->name('lots.index');
Route::get('lots/{lot}', [LotController::class, 'show'])->name('lots.show');

Route::middleware('throttle:6,1')->group(function () {
    Route::post('seller-questionnaire', [SellerSubmissionController::class, 'store'])->name('seller-submissions.store');
    Route::post('contact', [ContactEnquiryController::class, 'store'])->name('contact-enquiries.store');
});

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
