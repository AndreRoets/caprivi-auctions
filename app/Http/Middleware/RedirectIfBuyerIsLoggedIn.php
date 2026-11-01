<?php

namespace App\Http\Middleware;

use App\Support\Corex\BuyerSession;
use App\Support\Corex\ReturnUrl;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Buyer login / sign-up pages: a visitor who is already logged in goes on to where they were heading.
 */
class RedirectIfBuyerIsLoggedIn
{
    public function __construct(private BuyerSession $buyer) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->buyer->check()) {
            return redirect(ReturnUrl::sanitize($request->query('return')));
        }

        return $next($request);
    }
}
