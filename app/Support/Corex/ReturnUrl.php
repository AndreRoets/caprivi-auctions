<?php

namespace App\Support\Corex;

/**
 * "Back to where I was" links after login: only same-site paths are allowed,
 * so a crafted ?return= can never send a visitor to another website.
 */
class ReturnUrl
{
    public const FALLBACK = '/account';

    public static function sanitize(mixed $value, string $fallback = self::FALLBACK): string
    {
        if (! is_string($value) || $value === '') {
            return $fallback;
        }

        $isSitePath = str_starts_with($value, '/')
            && ! str_starts_with($value, '//')
            && ! str_contains($value, '\\')
            && ! preg_match('/[\x00-\x1F]/', $value);

        if (! $isSitePath) {
            return $fallback;
        }

        $path = (string) parse_url($value, PHP_URL_PATH);

        foreach (['/account/login', '/account/signup', '/account/forgot-password', '/account/logout'] as $authPath) {
            if (str_starts_with($path, $authPath)) {
                return $fallback;
            }
        }

        return $value;
    }
}
