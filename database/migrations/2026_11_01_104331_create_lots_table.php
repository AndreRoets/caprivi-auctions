<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};
