<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSellerSubmissionRequest extends FormRequest
{
    /**
     * @var list<string>
     */
    public const SELLER_TYPES = ['individual', 'married_in_community', 'company_or_trust', 'deceased_estate'];

    /**
     * @var list<string>
     */
    public const PROPERTY_TYPES = ['House', 'Townhouse', 'Apartment', 'Vacant land', 'Farm or smallholding', 'Commercial', 'Industrial'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'seller_type' => ['required', Rule::in(self::SELLER_TYPES)],
            'spouse_name' => ['nullable', 'required_if:seller_type,married_in_community', 'string', 'max:120'],
            'executor_name' => ['nullable', 'required_if:seller_type,deceased_estate', 'string', 'max:120'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:30'],
            'preferred_contact' => ['required', Rule::in(['phone', 'whatsapp', 'email'])],

            'property_type' => ['required', Rule::in(self::PROPERTY_TYPES)],
            'address' => ['required', 'string', 'max:255'],
            'suburb' => ['required', 'string', 'max:120'],
            'erf_size' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'floor_size' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'zoning' => ['nullable', 'string', 'max:60'],
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:50'],
            'bathrooms' => ['nullable', 'integer', 'min:0', 'max:50'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:60'],

            'occupancy' => ['required', Rule::in(['owner', 'tenant', 'vacant'])],
            'monthly_rent' => ['nullable', 'required_if:occupancy,tenant', 'integer', 'min:0'],
            'condition' => ['required', Rule::in(['excellent', 'good', 'fair', 'needs_work'])],
            'known_defects' => ['nullable', 'string', 'max:2000'],

            'has_bond' => ['required', 'boolean'],
            'bond_bank' => ['nullable', 'required_if:has_bond,true', 'string', 'max:80'],
            'bond_outstanding' => ['nullable', 'integer', 'min:0'],
            'in_arrears' => ['nullable', 'boolean'],
            'monthly_levies' => ['nullable', 'integer', 'min:0'],
            'municipal_value' => ['nullable', 'integer', 'min:0'],
            'price_expectation' => ['nullable', 'integer', 'min:0'],

            'auction_platform' => ['required', Rule::in(['online', 'live', 'hybrid', 'tender'])],
            'wants_reserve' => ['required', 'boolean'],
            'timing' => ['required', Rule::in(['asap', '1_3_months', '3_6_months', 'exploring'])],
            'reason_for_selling' => ['nullable', 'string', 'max:500'],
            'viewing_access' => ['required', Rule::in(['anytime', 'by_appointment', 'restricted'])],

            'documents' => ['nullable', 'array'],
            'documents.*' => ['string', 'max:80'],
            'referral_source' => ['nullable', 'string', 'max:120'],

            'accepts_terms' => ['accepted'],
            'confirms_authority' => ['accepted'],
            'consents_to_processing' => ['accepted'],
            'marketing_opt_in' => ['nullable', 'boolean'],
            'website' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'accepts_terms.accepted' => 'Please accept the terms to continue.',
            'confirms_authority.accepted' => 'Please confirm you are authorised to sell the property.',
            'consents_to_processing.accepted' => 'We need your consent to process this information.',
        ];
    }
}
