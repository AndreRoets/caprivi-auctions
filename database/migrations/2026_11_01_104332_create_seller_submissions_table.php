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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_submissions');
    }
};
