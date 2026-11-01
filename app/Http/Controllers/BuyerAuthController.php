<?php

namespace App\Http\Controllers;

use App\Support\Corex\BuyerSession;
use App\Support\Corex\CorexClient;
use App\Support\Corex\CorexException;
use App\Support\Corex\ReturnUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Buyer accounts are CoreX accounts (shared with the agency's own CoreX auction page).
 * The token CoreX returns is kept in the server-side session only.
 */
class BuyerAuthController extends Controller
{
    public function __construct(private CorexClient $corex, private BuyerSession $buyer) {}

    public function showLogin(Request $request): Response
    {
        return Inertia::render('account/login', ['returnTo' => ReturnUrl::sanitize($request->query('return'))]);
    }

    public function login(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $this->buyer->store($this->corex->post('/buyers/login', $validated));

        return redirect(ReturnUrl::sanitize($request->input('return')));
    }

    public function showSignup(Request $request): Response
    {
        return Inertia::render('account/signup', ['returnTo' => ReturnUrl::sanitize($request->query('return'))]);
    }

    public function sendSignupCode(Request $request): RedirectResponse
    {
        $validated = $request->validate(['email' => ['required', 'email', 'max:190']]);

        $this->corex->post('/buyers/signup/send', $validated);

        return back()->with('success', "We sent a 6-digit code to {$validated['email']}.");
    }

    public function verifySignup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:190'],
            'code' => ['required', 'string', 'max:12'],
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'confirmed'],
            'popia_consent' => ['accepted'],
        ], ['popia_consent.accepted' => 'Please accept so the agency may process your details.']);

        $this->buyer->store($this->corex->post('/buyers/signup/verify', [
            ...$validated,
            'password_confirmation' => $request->input('password_confirmation'),
            'popia_consent' => true,
        ]));

        return redirect(ReturnUrl::sanitize($request->input('return')))->with('success', 'Welcome! Your account is ready.');
    }

    public function showForgot(Request $request): Response
    {
        return Inertia::render('account/forgot-password', ['returnTo' => ReturnUrl::sanitize($request->query('return'))]);
    }

    public function sendResetCode(Request $request): RedirectResponse
    {
        $validated = $request->validate(['email' => ['required', 'email', 'max:190']]);

        $this->corex->post('/buyers/forgot/send', $validated);

        return back()->with('success', 'If that email has an account, we have sent it a 6-digit code.');
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:190'],
            'code' => ['required', 'string', 'max:12'],
            'password' => ['required', 'string', 'confirmed'],
        ]);

        $this->buyer->store($this->corex->post('/buyers/forgot/reset', [
            ...$validated,
            'password_confirmation' => $request->input('password_confirmation'),
        ]));

        return redirect(ReturnUrl::sanitize($request->input('return')))->with('success', 'Your password has been changed.');
    }

    public function logout(Request $request): RedirectResponse
    {
        if ($this->buyer->check()) {
            try {
                $this->corex->post('/buyers/logout');
            } catch (CorexException) {
                // The local session is cleared regardless.
            }
        }

        $this->buyer->forget();
        $request->session()->regenerate();

        return redirect()->route('auctions.index')->with('success', 'You have been logged out.');
    }
}
