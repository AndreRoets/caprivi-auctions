# Caprivi Auctions website

A Laravel 12 + Inertia (React) website. Its auction section is a front end for **CoreX OS**: auctions, lots, bids, buyer accounts, registrations, invoices and the "Sell at auction" questionnaire all live in CoreX and are reached through its JSON API. This site stores none of them.

Every CoreX call is made by this site's server. The browser only ever talks to this site's own routes, and the API key and buyer tokens never reach it.

## Connecting to CoreX

Add these to the server's `.env`. Never put them in browser code or git (`.env` is git-ignored):

```dotenv
COREX_AUCTIONS_API=https://YOUR-COREX-HOST/api/v1/website/auctions
COREX_API_KEY=your-key
# Only if a load balancer / proxy sits in front of the site, so CoreX gets the real visitor IP:
TRUSTED_PROXIES=*
```

To get the key in CoreX:

1. Go to **Admin → Agencies → (agency) → API Access → Connect a website**.
2. Choose the **"Auction website"** preset.
3. Copy the key into `COREX_API_KEY`.

Then run `php artisan config:clear`. The admin **Dashboard** shows whether CoreX is connected.

Optional settings: `COREX_TIMEOUT` (seconds, default 15) and `COREX_CACHE_SECONDS` (default 180). The cache setting controls how long `/site` and the auction lists are cached. Nothing buyer-specific and no live feed is ever cached.

## How it fits together

- **`app/Support/Corex/CorexClient.php`:** the only place that calls CoreX. It does three things:
  - Adds `Authorization: Bearer`, `Accept: application/json`, `X-Visitor-IP` and, when a buyer is logged in, `X-Buyer-Token`.
  - Sends registrations as multipart, streams document and invoice downloads, and caches `/site` and the auction lists.
  - Maps CoreX errors:

    | CoreX response | What the visitor sees |
    | --- | --- |
    | 422 | Inline field errors (CoreX's messages) |
    | 401 `buyer_token_invalid` | Logged out, sent to log in, then returned to the page they were on |
    | 429 | "Please wait a minute" |
    | 404 | Not found |
    | 403 | A friendly "not available yet" message |
    | Bad key, 5xx or timeout | "Temporarily unavailable" (details go only to the log) |
- **`app/Support/Corex/BuyerSession.php`:** keeps the `cxb_…` buyer token in the server-side session (an httpOnly cookie session). Only the buyer's name, email and phone are shared with the browser.
- **`resources/js/lib/corex.ts`:** pure logic for money formatting (`R 1 250 000`), countdowns on the server clock, the bid box and the sell questionnaire.

## Pages and routes

| URL | What it is |
| --- | --- |
| `/` | Home: auction teaser (live / coming up), the seller questionnaire (when switched on in CoreX), documents, FAQ |
| `/auctions` | Auction home: hero, live now, coming up, how bidding works, past auctions (if enabled), Sell section |
| `/auctions/{auction}` | Auction: description, lots, when & where, fee notice, documents, enquiry form |
| `/auctions/{auction}/lots/{lot}` | Lot: photo gallery, details, bidding activity, documents, enquiry form, bid card (polls the feed every 3 s while visible) |
| `/auctions/{auction}/register` | Register to bid (logged in): documents or "use the one on file", conditions, upload |
| `/account/signup`, `/account/login`, `/account/forgot-password` | Buyer sign-up (email code), login and password reset; all return the buyer to where they were |
| `/account` | My account: details, registrations, lots won, watching, invoices (PDF) |
| `/seller-questionnaire` (POST) | Sends the Sell form to CoreX `/sell` |
| `/lots/{lot}/bids`, `/lots/{lot}/auto-bid`, `/lots/{lot}/watch` | JSON bid actions used by the lot page |
| `/auctions/…/feed`, `/auctions/…/documents/{id}`, `/account/invoices/{id}/pdf` | Live feed and file downloads, fetched from CoreX by the server |
| `/dashboard`, `/admin/*` | Website admin: users, contact details, SEO (separate from CoreX buyer accounts) |

`/on-auction` (the old listing page) redirects to `/auctions`.

## Assumptions about CoreX responses

The API reference doesn't define these, so the code accepts the likely shapes:

- **Lot statuses:** a lot whose `status` / `lot_status` contains `sold` shows "Sold", and one containing `passed` shows "Passed in". Otherwise the pill follows `bidding.phase`.
- **`photos[]` items:** may be URL strings or objects. The code uses `url`, `large`, `original`, `src` or `thumb`.
- **`my_registration` and `registration.mine`:** assumed to look like the `registrations[]` entries in `/buyers/me` (`status`, `bidder_number`, `declined_reason`).
- **Document `download` values:** ignored. Files are always fetched by id through this server.
- **`PUT /buyers/me`:** the session name and phone are updated from what was sent, or from `data.buyer` if CoreX returns it.
- **`{auction}` and `{lot}`:** use the `id` from the listings. Ids are limited to letters, digits, `-` and `_`.

## Styling

The site keeps its existing Caprivi styling (navy/gold, Fraunces and Instrument Sans) instead of the colours and font from CoreX `/site`. CoreX supplies the auction hero title, intro, hero image and "how it works" text, the questionnaire options and the feature switches. The header, footer and contact details come from the site's own admin (**Website details**).

## Development and tests

```bash
composer install && npm install
php artisan migrate
composer run dev          # or: php artisan serve + npm run dev

php artisan test          # PHP feature tests (CoreX is mocked with Http::fake)
npm run test:js           # node:test unit tests for the sell form and bid box logic
```
