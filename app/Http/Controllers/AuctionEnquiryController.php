<?php

namespace App\Http\Controllers;

use App\Support\Corex\CorexClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Enquiries about an auction or a single lot, forwarded to the agency in CoreX.
 */
class AuctionEnquiryController extends Controller
{
    public function __construct(private CorexClient $corex) {}

    public function auction(Request $request, string $auction): RedirectResponse
    {
        $this->corex->post("/{$auction}/enquiries", $this->validated($request));

        return back()->with('success', 'Thank you, your enquiry has been sent. The auctioneer will be in touch.');
    }

    public function lot(Request $request, string $auction, string $lot): RedirectResponse
    {
        $this->corex->post("/{$auction}/lots/{$lot}/enquiries", $this->validated($request));

        return back()->with('success', 'Thank you, your enquiry has been sent. The auctioneer will be in touch.');
    }

    /**
     * @return array{name: string, email: string|null, phone: string|null, message: string|null, popia_consent: true}
     */
    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:190'],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:30'],
            'message' => ['nullable', 'string', 'max:2000'],
            'popia_consent' => ['accepted'],
        ], [
            'email.required_without' => 'Enter an email address or a phone number.',
            'phone.required_without' => 'Enter a phone number or an email address.',
            'popia_consent.accepted' => 'Please consent so the agency can contact you.',
        ]);

        return [
            'name' => $validated['name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'message' => $validated['message'] ?? null,
            'popia_consent' => true,
        ];
    }
}
