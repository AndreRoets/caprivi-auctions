<?php

namespace App\Http\Controllers;

use App\Support\Corex\CorexClient;
use App\Support\Corex\CorexException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Bid, auto-bid and watch actions for a logged-in buyer. Called with fetch() from the lot page;
 * CoreX enforces every bidding rule and its plain-language refusals are shown as-is.
 */
class BiddingController extends Controller
{
    public function __construct(private CorexClient $corex) {}

    public function bid(Request $request, string $lot): JsonResponse
    {
        $validated = $request->validate(['amount' => ['required', 'integer', 'min:1']]);

        return $this->respond(fn () => $this->corex->post("/lots/{$lot}/bids", ['amount' => (int) $validated['amount']]));
    }

    public function setAutoBid(Request $request, string $lot): JsonResponse
    {
        $validated = $request->validate(['max' => ['required', 'integer', 'min:1']]);

        return $this->respond(fn () => $this->corex->post("/lots/{$lot}/auto-bid", ['max' => (int) $validated['max']]));
    }

    public function cancelAutoBid(string $lot): JsonResponse
    {
        return $this->respond(fn () => $this->corex->delete("/lots/{$lot}/auto-bid"));
    }

    public function watch(string $lot): JsonResponse
    {
        return $this->respond(fn () => $this->corex->post("/lots/{$lot}/watch"));
    }

    /**
     * @param  callable(): array<string, mixed>  $call
     */
    private function respond(callable $call): JsonResponse
    {
        try {
            $result = $call();
        } catch (CorexException $exception) {
            if ($exception->errorCode === CorexException::FORBIDDEN) {
                throw CorexException::forbidden('You need an approved registration for this auction before you can bid.');
            }

            throw $exception;
        }

        return response()->json([
            'data' => $result['data'] ?? null,
            'watching' => $result['watching'] ?? $result['data']['watching'] ?? null,
        ]);
    }
}
