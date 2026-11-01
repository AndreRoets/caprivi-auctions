<?php

namespace App\Support\Corex;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Server-side client for the CoreX website auctions API.
 *
 * Adds the API key, Accept, visitor IP and (when logged in) buyer token headers,
 * and turns CoreX errors into friendly exceptions. Never call CoreX from the browser.
 */
class CorexClient
{
    public function __construct(private Request $request, private BuyerSession $buyer) {}

    public function isConfigured(): bool
    {
        return filled(config('services.corex.auctions_api')) && filled(config('services.corex.api_key'));
    }

    /**
     * Agency branding, texts, features and questionnaire options. Cached: not buyer specific.
     *
     * @return array<string, mixed>
     */
    public function site(): array
    {
        return Cache::remember('corex.site', config('services.corex.cache_seconds'), fn () => $this->get('/site', withBuyer: false)['data'] ?? []);
    }

    /**
     * Public auction cards for a phase (live, upcoming or finished). Cached: not buyer specific.
     *
     * @return list<array<string, mixed>>
     */
    public function auctions(string $phase): array
    {
        return Cache::remember("corex.auctions.{$phase}", config('services.corex.cache_seconds'), fn () => $this->get('/', ['phase' => $phase], withBuyer: false)['data'] ?? []);
    }

    /**
     * The site settings, or null when CoreX is not configured or not reachable,
     * so public pages can still render without the auction sections.
     *
     * @return array<string, mixed>|null
     */
    public function siteOrNull(): ?array
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            return $this->site() ?: null;
        } catch (CorexException) {
            return null;
        }
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function auctionsOrEmpty(string $phase): array
    {
        try {
            return $this->auctions($phase);
        } catch (CorexException) {
            return [];
        }
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<string, mixed>
     */
    public function get(string $path, array $query = [], bool $withBuyer = true): array
    {
        return $this->send('get', $path, $query, $withBuyer);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function post(string $path, array $data = []): array
    {
        return $this->send('post', $path, $data);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function put(string $path, array $data = []): array
    {
        return $this->send('put', $path, $data);
    }

    /**
     * @return array<string, mixed>
     */
    public function delete(string $path): array
    {
        return $this->send('delete', $path);
    }

    /**
     * Multipart POST (used for bidder registration with document uploads).
     *
     * @param  array<string, scalar|null>  $fields
     * @param  array<string, UploadedFile>  $files  keyed by the CoreX field name, e.g. "documents[id_copy]"
     * @return array<string, mixed>
     */
    public function postMultipart(string $path, array $fields, array $files): array
    {
        $pending = $this->pending()->asMultipart();

        foreach ($files as $name => $file) {
            $pending->attach($name, fopen($file->getRealPath(), 'r'), $file->getClientOriginalName(), ['Content-Type' => $file->getMimeType()]);
        }

        $multipart = [];
        foreach ($fields as $name => $value) {
            if ($value !== null) {
                $multipart[] = ['name' => $name, 'contents' => is_bool($value) ? ($value ? '1' : '0') : (string) $value];
            }
        }

        return $this->decode($this->attempt(fn () => $pending->post($this->url($path), $multipart)));
    }

    /**
     * Fetches a CoreX file (document or invoice PDF) and streams it to the visitor.
     */
    public function download(string $path, string $fallbackName = 'document.pdf'): StreamedResponse
    {
        $response = $this->attempt(fn () => $this->pending()->withOptions(['stream' => true])->get($this->url($path)));
        $this->guard($response);

        $body = $response->toPsrResponse()->getBody();
        $disposition = $response->header('Content-Disposition') ?: 'attachment; filename="'.addslashes($fallbackName).'"';

        return new StreamedResponse(function () use ($body): void {
            while (! $body->eof()) {
                echo $body->read(65536);
                flush();
            }
        }, 200, array_filter([
            'Content-Type' => $response->header('Content-Type') ?: 'application/octet-stream',
            'Content-Disposition' => $disposition,
            'Content-Length' => $response->header('Content-Length') ?: null,
            'Cache-Control' => 'private, no-store',
        ]));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function send(string $method, string $path, array $data = [], bool $withBuyer = true): array
    {
        $pending = $this->pending($withBuyer);

        if ($method !== 'get') {
            $pending->asJson();
        }

        return $this->decode($this->attempt(fn () => $pending->{$method}($this->url($path), $data)));
    }

    private function pending(bool $withBuyer = true): PendingRequest
    {
        if (! $this->isConfigured()) {
            throw CorexException::unavailable();
        }

        $headers = ['X-Visitor-IP' => (string) $this->request->ip()];

        if ($withBuyer && ($token = $this->buyer->token())) {
            $headers['X-Buyer-Token'] = $token;
        }

        return Http::withToken((string) config('services.corex.api_key'))
            ->acceptJson()
            ->withHeaders($headers)
            ->timeout(config('services.corex.timeout'));
    }

    private function url(string $path): string
    {
        $path = trim($path, '/');

        return config('services.corex.auctions_api').($path === '' ? '' : '/'.$path);
    }

    /**
     * @param  callable(): Response  $call
     */
    private function attempt(callable $call): Response
    {
        try {
            return $call();
        } catch (ConnectionException $exception) {
            Log::warning('CoreX connection failed', ['error' => $exception->getMessage()]);

            throw CorexException::unavailable();
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function decode(Response $response): array
    {
        $this->guard($response);

        return $response->json() ?? [];
    }

    /**
     * Maps CoreX error responses to exceptions that are safe to show visitors.
     */
    private function guard(Response $response): void
    {
        if ($response->successful()) {
            return;
        }

        $status = $response->status();
        $code = $response->json('code');

        if ($status === 401 && $code === 'buyer_token_invalid') {
            $this->buyer->forget();

            throw CorexException::loginRequired();
        }

        if ($status === 422) {
            $errors = $response->json('errors');
            $message = $response->json('message');

            throw ValidationException::withMessages(is_array($errors) && $errors !== []
                ? $errors
                : ['form' => is_string($message) && $message !== '' ? $message : 'Please check the details and try again.']);
        }

        if ($status === 429) {
            throw CorexException::rateLimited();
        }

        if ($status === 404) {
            abort(404);
        }

        if ($status === 403) {
            throw CorexException::forbidden();
        }

        Log::error('CoreX request failed', ['status' => $status, 'path' => parse_url((string) $response->effectiveUri(), PHP_URL_PATH)]);

        throw CorexException::unavailable();
    }
}
