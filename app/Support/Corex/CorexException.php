<?php

namespace App\Support\Corex;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

/**
 * A CoreX failure, already translated into a message that is safe to show visitors.
 * Raw CoreX responses never reach the browser.
 */
class CorexException extends RuntimeException
{
    public const UNAVAILABLE = 'unavailable';

    public const FORBIDDEN = 'forbidden';

    public const RATE_LIMITED = 'rate_limited';

    public const LOGIN_REQUIRED = 'login_required';

    public function __construct(string $message, public readonly int $status, public readonly string $errorCode)
    {
        parent::__construct($message);
    }

    public static function unavailable(): self
    {
        return new self('Online auctions are temporarily unavailable. Please try again in a few minutes.', 503, self::UNAVAILABLE);
    }

    public static function forbidden(?string $message = null): self
    {
        return new self($message ?? 'That is not available to you yet.', 403, self::FORBIDDEN);
    }

    public static function rateLimited(): self
    {
        return new self('Too many attempts, please wait a minute and try again.', 429, self::RATE_LIMITED);
    }

    public static function loginRequired(): self
    {
        return new self('Please log in to continue.', 401, self::LOGIN_REQUIRED);
    }

    public function render(Request $request): Response
    {
        if ($this->errorCode === self::LOGIN_REQUIRED) {
            return $this->loginRedirect($request);
        }

        if ($this->wantsJson($request)) {
            return new JsonResponse(['message' => $this->getMessage(), 'code' => $this->errorCode], $this->status);
        }

        if (! $request->isMethod('GET')) {
            return back()->withErrors(['form' => $this->getMessage()]);
        }

        abort($this->status, $this->getMessage());
    }

    private function loginRedirect(Request $request): Response
    {
        $return = $request->isMethod('GET') && ! $this->wantsJson($request)
            ? $request->getRequestUri()
            : parse_url((string) url()->previous(), PHP_URL_PATH);

        $loginUrl = route('buyer.login', ['return' => ReturnUrl::sanitize($return)]);

        if ($this->wantsJson($request)) {
            return new JsonResponse(['message' => $this->getMessage(), 'code' => $this->errorCode, 'login_url' => $loginUrl], 401);
        }

        return new RedirectResponse($loginUrl);
    }

    private function wantsJson(Request $request): bool
    {
        return ! $request->header('X-Inertia') && $request->expectsJson();
    }
}
