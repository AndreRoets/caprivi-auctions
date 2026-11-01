<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteSettingsRequest extends FormRequest
{
    private const PHONE = 'regex:/^\+?[0-9 ()-]{6,30}$/';

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
            'company_name' => ['required', 'string', 'max:80'],
            'tagline' => ['nullable', 'string', 'max:80'],
            'legal_name' => ['required', 'string', 'max:160'],
            'address' => ['required', 'string', 'max:255'],

            'main_phone' => ['required', 'string', self::PHONE],
            'mobile_phone' => ['nullable', 'string', self::PHONE],
            'extra_phones' => ['present', 'array', 'max:6'],
            'extra_phones.*' => ['string', self::PHONE],
            'whatsapp' => ['nullable', 'string', self::PHONE],
            'emails' => ['required', 'array', 'min:1', 'max:5'],
            'emails.*' => ['email', 'max:190'],

            'parent_site_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'main_phone.regex' => 'Enter a valid phone number, e.g. 010 001 9469.',
            'mobile_phone.regex' => 'Enter a valid phone number, e.g. 082 348 4595.',
            'extra_phones.*.regex' => 'Each extra number must be a valid phone number.',
            'whatsapp.regex' => 'Enter a valid WhatsApp number, e.g. 068 452 2930.',
            'emails.required' => 'Add at least one email address.',
            'emails.*.email' => 'Each email address must be valid.',
        ];
    }
}
