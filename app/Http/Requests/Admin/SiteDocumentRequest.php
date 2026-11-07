<?php

namespace App\Http\Requests\Admin;

use App\Models\SiteDocument;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiteDocumentRequest extends FormRequest
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
        $isUpdating = $this->route('siteDocument') !== null;

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'access' => ['required', Rule::in(array_keys(SiteDocument::ACCESS_OPTIONS))],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'is_published' => ['required', 'boolean'],
            'file' => [
                $isUpdating ? 'nullable' : 'required',
                'file',
                'max:20480',
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip,jpg,jpeg,png',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.max' => 'The file may not be larger than 20 MB.',
            'file.mimes' => 'Upload a PDF, Word, Excel, PowerPoint, text, zip or image file.',
        ];
    }
}
