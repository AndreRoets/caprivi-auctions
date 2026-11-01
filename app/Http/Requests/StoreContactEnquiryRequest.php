<?php

namespace App\Http\Requests;

use App\Models\ContactEnquiry;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactEnquiryRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:190'],
            'subject' => ['required', 'string', Rule::in(ContactEnquiry::SUBJECTS)],
            'message' => ['required', 'string', 'max:3000'],
            'website' => ['prohibited'],
        ];
    }
}
