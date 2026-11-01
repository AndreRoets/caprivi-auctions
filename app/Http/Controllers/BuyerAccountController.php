<?php

namespace App\Http\Controllers;

use App\Support\Corex\BuyerSession;
use App\Support\Corex\CorexClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BuyerAccountController extends Controller
{
    public function __construct(private CorexClient $corex) {}

    public function show(): Response
    {
        return Inertia::render('account/index', [
            'account' => $this->corex->get('/buyers/me')['data'] ?? [],
        ]);
    }

    public function update(Request $request, BuyerSession $buyer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $result = $this->corex->put('/buyers/me', $validated);
        $buyer->updateBuyer([...($buyer->buyer() ?? []), ...$validated, ...($result['data']['buyer'] ?? [])]);

        return back()->with('success', 'Your details have been saved.');
    }

    public function invoicePdf(string $invoice): StreamedResponse
    {
        return $this->corex->download("/buyers/me/invoices/{$invoice}/pdf", "invoice-{$invoice}.pdf");
    }
}
