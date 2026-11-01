<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Auctions, lots and seller questionnaires now live in CoreX, so the local demo tables go.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contact_enquiries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('lot_id');
        });

        Schema::dropIfExists('lots');
        Schema::dropIfExists('seller_submissions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->string('web_ref')->unique();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('summary', 500);
            $table->text('description');
            $table->string('property_type');
            $table->string('province');
            $table->string('city');
            $table->string('suburb');
            $table->string('address')->nullable();
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->unsignedTinyInteger('garages')->nullable();
            $table->unsignedInteger('erf_size')->nullable();
            $table->unsignedInteger('floor_size')->nullable();
            $table->unsignedBigInteger('opening_bid');
            $table->unsignedInteger('monthly_rates')->nullable();
            $table->unsignedInteger('monthly_levies')->nullable();
            $table->string('auction_type');
            $table->string('status');
            $table->string('auctioneer');
            $table->timestamp('bidding_opens_at')->nullable();
            $table->timestamp('bidding_closes_at')->nullable();
            $table->string('bid_url')->nullable();
            $table->string('image_url')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['status', 'bidding_closes_at']);
        });

        Schema::create('seller_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('seller_type');
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('preferred_contact');
            $table->string('property_type');
            $table->string('address');
            $table->string('suburb');
            $table->unsignedBigInteger('price_expectation')->nullable();
            $table->string('auction_platform')->nullable();
            $table->json('answers');
            $table->boolean('marketing_opt_in')->default(false);
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::table('contact_enquiries', function (Blueprint $table) {
            $table->foreignId('lot_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });
    }
};
