<?php

namespace Tests\Feature\Corex;

use App\Support\Corex\BuyerSession;
use App\Support\Corex\CorexClient;
use App\Support\Corex\CorexException;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Tests\TestCase;

class CorexClientTest extends TestCase
{
    private const API = 'https://corex.test/api/v1/website/auctions';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.corex.auctions_api' => self::API,
            'services.corex.api_key' => 'test-key',
        ]);

        $request = Request::create('/', 'GET', server: ['REMOTE_ADDR' => '203.0.113.9']);
        $request->setLaravelSession($this->app['session.store']);
        $this->app->instance('request', $request);
    }

    private function client(): CorexClient
    {
        return $this->app->make(CorexClient::class);
    }

    public function test_sends_key_accept_and_visitor_ip_headers_without_a_buyer_token_when_logged_out(): void
    {
        Http::fake([self::API.'/12' => Http::response(['data' => ['id' => 12]])]);

        $this->assertSame(['data' => ['id' => 12]], $this->client()->get('/12'));

        Http::assertSent(fn (ClientRequest $request) => $request->url() === self::API.'/12'
            && $request->hasHeader('Authorization', 'Bearer test-key')
            && $request->hasHeader('Accept', 'application/json')
            && $request->hasHeader('X-Visitor-IP', '203.0.113.9')
            && ! $request->hasHeader('X-Buyer-Token'));
    }

    public function test_sends_the_buyer_token_when_logged_in(): void
    {
        $this->app->make(BuyerSession::class)->store(['token' => 'cxb_secret', 'expires_at' => now()->addDays(30)->toIso8601String(), 'buyer' => ['email' => 'a@b.co']]);
        Http::fake([self::API.'/buyers/me' => Http::response(['data' => []])]);

        $this->client()->get('/buyers/me');

        Http::assertSent(fn (ClientRequest $request) => $request->hasHeader('X-Buyer-Token', 'cxb_secret'));
    }

    public function test_cached_reads_never_send_the_buyer_token(): void
    {
        $this->app->make(BuyerSession::class)->store(['token' => 'cxb_secret', 'buyer' => []]);
        Http::fake([self::API.'/site' => Http::response(['data' => ['agency' => ['name' => 'Agency']]])]);

        $this->assertSame(['agency' => ['name' => 'Agency']], $this->client()->site());
        $this->client()->site();

        Http::assertSentCount(1);
        Http::assertSent(fn (ClientRequest $request) => ! $request->hasHeader('X-Buyer-Token'));
    }

    public function test_sends_json_bodies(): void
    {
        Http::fake([self::API.'/buyers/login' => Http::response(['ok' => true, 'token' => 'cxb_1'])]);

        $this->client()->post('/buyers/login', ['email' => 'a@b.co', 'password' => 'secret']);

        Http::assertSent(fn (ClientRequest $request) => $request->method() === 'POST'
            && $request->isJson()
            && $request['email'] === 'a@b.co');
    }

    public function test_sends_registration_as_multipart_with_files(): void
    {
        Http::fake([self::API.'/7/registration' => Http::response(['ok' => true, 'data' => ['status' => 'pending']], 201)]);

        $this->client()->postMultipart('/7/registration', ['bidder_type' => 'individual', 'accept_conditions' => true], [
            'documents[id_copy]' => UploadedFile::fake()->create('id.pdf', 20, 'application/pdf'),
        ]);

        Http::assertSent(fn (ClientRequest $request) => $request->isMultipart()
            && str_contains($request->header('Content-Type')[0], 'multipart/form-data')
            && collect($request->data())->contains(fn (array $part) => $part['name'] === 'documents[id_copy]')
            && collect($request->data())->contains(fn (array $part) => $part['name'] === 'accept_conditions' && $part['contents'] === '1'));
    }

    public function test_maps_422_errors_to_field_validation_errors(): void
    {
        Http::fake(['*' => Http::response(['message' => 'Invalid', 'errors' => ['email' => ['Those details do not match.']]], 422)]);

        try {
            $this->client()->post('/buyers/login', []);
            $this->fail('Expected a validation exception.');
        } catch (ValidationException $exception) {
            $this->assertSame(['email' => ['Those details do not match.']], $exception->errors());
        }
    }

    public function test_maps_a_422_without_field_errors_to_a_form_error(): void
    {
        Http::fake(['*' => Http::response(['message' => 'Your bid must be at least R 260 000.'], 422)]);

        try {
            $this->client()->post('/lots/5/bids', ['amount' => 1]);
            $this->fail('Expected a validation exception.');
        } catch (ValidationException $exception) {
            $this->assertSame(['form' => ['Your bid must be at least R 260 000.']], $exception->errors());
        }
    }

    public function test_invalid_buyer_token_clears_the_session_and_asks_to_log_in(): void
    {
        $session = $this->app->make(BuyerSession::class);
        $session->store(['token' => 'cxb_old', 'buyer' => ['email' => 'a@b.co']]);
        Http::fake(['*' => Http::response(['message' => 'Unauthenticated.', 'code' => 'buyer_token_invalid'], 401)]);

        try {
            $this->client()->get('/buyers/me');
            $this->fail('Expected a login-required exception.');
        } catch (CorexException $exception) {
            $this->assertSame(CorexException::LOGIN_REQUIRED, $exception->errorCode);
        }

        $this->assertNull($session->token());
    }

    public function test_a_rejected_api_key_is_reported_as_unavailable_without_leaking_details(): void
    {
        Http::fake(['*' => Http::response(['message' => 'Invalid API key abc'], 401)]);

        $this->assertCorexError(CorexException::UNAVAILABLE, 503, fn () => $this->client()->get('/site', withBuyer: false));
    }

    public function test_maps_403_and_429_to_friendly_errors(): void
    {
        Http::fake([
            self::API.'/lots/1/bids' => Http::response(['message' => 'Registration not approved'], 403),
            self::API.'/sell' => Http::response(['message' => 'Slow down', 'code' => 'rate_limited'], 429),
        ]);

        $this->assertCorexError(CorexException::FORBIDDEN, 403, fn () => $this->client()->post('/lots/1/bids'));
        $this->assertCorexError(CorexException::RATE_LIMITED, 429, fn () => $this->client()->post('/sell'));
    }

    public function test_maps_404_to_not_found(): void
    {
        Http::fake(['*' => Http::response(['message' => 'Not found'], 404)]);

        $this->expectException(NotFoundHttpException::class);

        $this->client()->get('/999');
    }

    public function test_refuses_to_call_corex_when_not_configured(): void
    {
        config(['services.corex.api_key' => null]);
        Http::fake();

        $this->assertCorexError(CorexException::UNAVAILABLE, 503, fn () => $this->client()->get('/site'));
        Http::assertNothingSent();
    }

    private function assertCorexError(string $code, int $status, callable $call): void
    {
        try {
            $call();
            $this->fail("Expected a CoreX {$code} error.");
        } catch (CorexException $exception) {
            $this->assertSame($code, $exception->errorCode);
            $this->assertSame($status, $exception->status);
            $this->assertStringNotContainsString('abc', $exception->getMessage());
        }
    }
}
