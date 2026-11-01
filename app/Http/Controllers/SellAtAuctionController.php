<?php

namespace App\Http\Controllers;

use App\Support\Corex\CorexClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * The "Sell at auction" questionnaire. CoreX validates the answers and notifies the agency;
 * this only forwards the known fields (honeypot included) from the visitor's browser.
 */
class SellAtAuctionController extends Controller
{
    /**
     * @var list<string>
     */
    public const FIELDS = [
        'seller_type', 'spouse_name', 'executor_name', 'name', 'email', 'phone', 'preferred_contact',
        'property_type', 'address', 'suburb', 'zoning', 'erf_size', 'floor_size', 'bedrooms', 'bathrooms', 'features',
        'occupancy', 'monthly_rent', 'condition', 'defects',
        'has_bond', 'bond_bank', 'bond_amount', 'bond_arrears', 'levies', 'municipal_valuation', 'price_expectation',
        'auction_format', 'reserve', 'timing', 'viewing', 'sale_reason',
        'documents', 'referral_source',
        'consent_terms', 'consent_authorised', 'consent_processing', 'marketing_opt_in',
        'website',
    ];

    public function store(Request $request, CorexClient $corex): RedirectResponse
    {
        $result = $corex->post('/sell', $request->only(self::FIELDS));

        return back()->with('sell_response', $result['response_text'] ?? 'shortly');
    }
}
