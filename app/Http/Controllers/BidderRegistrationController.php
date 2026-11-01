<?php

namespace App\Http\Controllers;

use App\Support\Corex\CorexClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Register to bid on an auction: documents are uploaded (or reused from file) and the agency approves in CoreX.
 */
class BidderRegistrationController extends Controller
{
    public function __construct(private CorexClient $corex) {}

    public function create(string $auction): Response
    {
        return Inertia::render('auctions/register', [
            'auction' => $this->corex->get("/{$auction}")['data'] ?? [],
            'registration' => $this->corex->get("/{$auction}/registration")['data'] ?? [],
        ]);
    }

    public function store(Request $request, string $auction): RedirectResponse
    {
        $validated = $request->validate([
            'bidder_type' => ['required', 'in:individual,company'],
            'company_name' => ['nullable', 'required_if:bidder_type,company', 'string', 'max:190'],
            'company_reg_no' => ['nullable', 'required_if:bidder_type,company', 'string', 'max:60'],
            'accept_conditions' => ['accepted'],
            'documents' => ['nullable', 'array'],
            'documents.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'existing' => ['nullable', 'array'],
            'existing.*' => ['nullable', 'alpha_dash', 'max:64'],
        ], [
            'accept_conditions.accepted' => 'Please accept the conditions of sale to register.',
            'documents.*.mimes' => 'Upload a PDF, JPG or PNG file.',
            'documents.*.max' => 'Each file must be 10 MB or smaller.',
        ]);

        $fields = [
            'bidder_type' => $validated['bidder_type'],
            'company_name' => $validated['bidder_type'] === 'company' ? $validated['company_name'] : null,
            'company_reg_no' => $validated['bidder_type'] === 'company' ? $validated['company_reg_no'] : null,
            'accept_conditions' => true,
        ];

        $files = [];
        foreach ($request->file('documents', []) as $kind => $file) {
            if ($file instanceof UploadedFile && $this->isDocumentKind($kind)) {
                $files["documents[{$kind}]"] = $file;
            }
        }

        foreach ($validated['existing'] ?? [] as $kind => $id) {
            if (filled($id) && $this->isDocumentKind($kind) && ! isset($files["documents[{$kind}]"])) {
                $fields["existing[{$kind}]"] = $id;
            }
        }

        $this->corex->postMultipart("/{$auction}/registration", $fields, $files);

        return redirect()->route('auctions.show', $auction)
            ->with('success', 'Registration submitted. The auctioneer will review your documents and email your bidder number once approved.');
    }

    private function isDocumentKind(mixed $kind): bool
    {
        return is_string($kind) && preg_match('/^[A-Za-z0-9_-]{1,64}$/', $kind) === 1;
    }
}
