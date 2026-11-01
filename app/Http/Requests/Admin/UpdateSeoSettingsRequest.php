<?php

namespace App\Http\Requests\Admin;

use App\Support\SiteSettings;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoSettingsRequest extends FormRequest
{
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
        $rules = [
            'seo_description' => ['required', 'string', 'max:300'],
            'seo_keywords' => ['nullable', 'string', 'max:500'],
            'seo_allow_indexing' => ['required', 'boolean'],
            'seo_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_seo_image' => ['nullable', 'boolean'],
            'seo_twitter_handle' => ['nullable', 'string', 'regex:/^@?[A-Za-z0-9_]{1,15}$/'],
            'seo_google_verification' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/'],
            'seo_bing_verification' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/'],
            'seo_google_analytics_id' => ['nullable', 'string', 'regex:/^G-[A-Z0-9]{4,20}$/'],
            'seo_google_tag_manager_id' => ['nullable', 'string', 'regex:/^GTM-[A-Z0-9]{4,12}$/'],
            'seo_pages' => ['required', 'array:'.implode(',', array_keys(SiteSettings::SEO_PAGES))],
        ];

        foreach (array_keys(SiteSettings::SEO_PAGES) as $page) {
            $rules["seo_pages.{$page}.title"] = ['required', 'string', 'max:70'];
            $rules["seo_pages.{$page}.description"] = ['required', 'string', 'max:300'];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'seo_twitter_handle.regex' => 'Enter an X (Twitter) handle such as @capriviauctions.',
            'seo_google_verification.regex' => 'Paste only the verification code, not the whole meta tag.',
            'seo_bing_verification.regex' => 'Paste only the verification code, not the whole meta tag.',
            'seo_google_analytics_id.regex' => 'Google Analytics IDs look like G-XXXXXXXXXX.',
            'seo_google_tag_manager_id.regex' => 'Tag Manager IDs look like GTM-XXXXXXX.',
            'seo_pages.*.title.required' => 'Every page needs a title.',
            'seo_pages.*.description.required' => 'Every page needs a description.',
        ];
    }
}
