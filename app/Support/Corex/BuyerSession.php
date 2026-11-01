<?php

namespace App\Support\Corex;

use Illuminate\Contracts\Session\Session;
use Illuminate\Support\Carbon;

/**
 * Keeps the CoreX buyer token in the visitor's server-side session.
 * The token never leaves the server: only the buyer's name/email are shared with the browser.
 */
class BuyerSession
{
    private const TOKEN_KEY = 'corex.buyer_token';

    private const EXPIRES_KEY = 'corex.buyer_expires_at';

    private const BUYER_KEY = 'corex.buyer';

    public function __construct(private Session $session) {}

    public function token(): ?string
    {
        $token = $this->session->get(self::TOKEN_KEY);
        $expiresAt = $this->session->get(self::EXPIRES_KEY);

        if ($token && $expiresAt && Carbon::parse($expiresAt)->isPast()) {
            $this->forget();

            return null;
        }

        return $token ?: null;
    }

    public function check(): bool
    {
        return $this->token() !== null;
    }

    /**
     * @return array{email?: string, name?: string, phone?: string|null}|null
     */
    public function buyer(): ?array
    {
        return $this->check() ? $this->session->get(self::BUYER_KEY) : null;
    }

    /**
     * @param  array{token: string, expires_at?: string|null, buyer?: array<string, mixed>|null}  $login
     */
    public function store(array $login): void
    {
        $this->session->migrate(true);
        $this->session->put(self::TOKEN_KEY, $login['token']);
        $this->session->put(self::EXPIRES_KEY, $login['expires_at'] ?? null);
        $this->session->put(self::BUYER_KEY, $this->publicBuyer($login['buyer'] ?? []));
    }

    /**
     * @param  array<string, mixed>  $buyer
     */
    public function updateBuyer(array $buyer): void
    {
        $this->session->put(self::BUYER_KEY, $this->publicBuyer($buyer));
    }

    public function forget(): void
    {
        $this->session->forget([self::TOKEN_KEY, self::EXPIRES_KEY, self::BUYER_KEY]);
    }

    /**
     * @param  array<string, mixed>  $buyer
     * @return array{email: string|null, name: string|null, phone: string|null}
     */
    private function publicBuyer(array $buyer): array
    {
        return [
            'email' => $buyer['email'] ?? null,
            'name' => $buyer['name'] ?? null,
            'phone' => $buyer['phone'] ?? null,
        ];
    }
}
