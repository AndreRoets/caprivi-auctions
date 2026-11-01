<?php

namespace App\Http\Middleware;

use App\Support\Corex\BuyerSession;
use App\Support\Corex\CorexException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Buyer-only pages and actions: sends logged-out visitors to the buyer login,
 * remembering where they were so they come straight back afterwards.
 */
class EnsureBuyerIsLoggedIn
{
    public function __construct(private BuyerSession $buyer) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->buyer->check()) {
            return CorexException::loginRequired()->render($request);
        }

        return $next($request);
    }
}
