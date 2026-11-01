/**
 * Pure helpers for the CoreX auction pages: money, time, the bid box and the sell questionnaire.
 * Kept free of imports so it can be unit-tested with `node --test` (see tests/js).
 */

export const TIME_ZONE = 'Africa/Johannesburg';

/* ─── Money ─────────────────────────────────────────────────────────── */

/** Groups digits in threes with spaces: 1250000 -> "1 250 000". */
export function groupThousands(amount: number): string {
    return Math.round(amount)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** "R 1 250 000". Null/undefined become an em dash. */
export function formatRand(amount: number | null | undefined): string {
    return amount === null || amount === undefined || Number.isNaN(amount) ? '—' : `R ${groupThousands(amount)}`;
}

/** Keeps only digits: "R 1,500,000" -> 1500000; empty -> null. */
export function stripNumber(value: string | number | null | undefined): number | null {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? Math.trunc(value) : null;
    }

    const digits = (value ?? '').replace(/[^\d]/g, '');

    return digits === '' ? null : Number(digits);
}

/** Re-formats a typed amount with thousands spaces: "1250000" -> "1 250 000". */
export function formatAmountInput(value: string): string {
    const amount = stripNumber(value);

    return amount === null ? '' : groupThousands(amount);
}

/* ─── Dates & clocks ────────────────────────────────────────────────── */

export function formatDateTime(iso: string | null | undefined): string {
    if (!iso) {
        return 'To be confirmed';
    }

    return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short', timeZone: TIME_ZONE }).format(new Date(iso));
}

export function formatDate(iso: string | null | undefined): string {
    if (!iso) {
        return 'To be confirmed';
    }

    return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: TIME_ZONE }).format(new Date(iso));
}

/** How far the visitor's clock is behind the server (ms). Add it to Date.now() to get server time. */
export function clockOffset(serverNow: string, clientNowMs: number): number {
    const server = Date.parse(serverNow);

    return Number.isNaN(server) ? 0 : server - clientNowMs;
}

/** Whole seconds until `target`, measured on the server's clock. Never negative. */
export function secondsUntil(target: string | null, offsetMs: number, clientNowMs: number): number | null {
    if (!target) {
        return null;
    }

    const end = Date.parse(target);

    return Number.isNaN(end) ? null : Math.max(0, Math.floor((end - (clientNowMs + offsetMs)) / 1000));
}

/** 37934 -> "10h 32m 14s"; days are shown when there are any. */
export function formatCountdown(totalSeconds: number): string {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days > 0 ? `${days}d ` : ''}${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export function timeAgo(iso: string, nowMs: number): string {
    const seconds = Math.max(0, Math.round((nowMs - Date.parse(iso)) / 1000));

    if (seconds < 45) {
        return 'just now';
    }

    const units: [number, string][] = [
        [86400, 'day'],
        [3600, 'hour'],
        [60, 'minute'],
    ];

    for (const [size, unit] of units) {
        if (seconds >= size) {
            const count = Math.round(seconds / size);

            return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
        }
    }

    return 'just now';
}

/* ─── Photos & status ───────────────────────────────────────────────── */

type PhotoLike =
    | string
    | { url?: string; src?: string; large?: string; original?: string; thumb?: string; thumbnail_url?: string }
    | null
    | undefined;

/** CoreX photos may be plain URLs or objects; returns the best full-size URL. */
export function photoUrl(photo: PhotoLike): string | null {
    if (!photo) {
        return null;
    }

    if (typeof photo === 'string') {
        return photo;
    }

    return photo.url ?? photo.large ?? photo.original ?? photo.src ?? photo.thumb ?? photo.thumbnail_url ?? null;
}

export function photoThumb(photo: PhotoLike): string | null {
    if (photo && typeof photo === 'object') {
        return photo.thumb ?? photo.thumbnail_url ?? photoUrl(photo);
    }

    return photoUrl(photo);
}

export type PillTone = 'live' | 'upcoming' | 'ended' | 'sold';

/** The status pill for a lot, from its bidding phase and CoreX lot status. */
export function lotPill(phase: string | null | undefined, lotStatus: string | null | undefined): { label: string; tone: PillTone } {
    const status = (lotStatus ?? '').toLowerCase();

    if (status.includes('sold')) {
        return { label: 'Sold', tone: 'sold' };
    }

    if (status.includes('passed')) {
        return { label: 'Passed in', tone: 'ended' };
    }

    if (phase === 'open') {
        return { label: 'Live · bidding open', tone: 'live' };
    }

    if (phase === 'upcoming') {
        return { label: 'Upcoming', tone: 'upcoming' };
    }

    return { label: 'Ended', tone: 'ended' };
}

/* ─── Bid box ───────────────────────────────────────────────────────── */

export const QUICK_MULTIPLIERS = [1, 2, 5, 10] as const;

export function quickIncrements(increment: number): number[] {
    return QUICK_MULTIPLIERS.map((multiplier) => multiplier * increment);
}

/** A quick button adds to what is in the box, starting from at least the minimum next bid. */
export function addToBid(currentText: string, minNext: number, amount: number): number {
    return Math.max(stripNumber(currentText) ?? 0, minNext) + amount;
}

/** The error shown under the bid box, or null when the amount may be placed. */
export function bidError(value: string, minNext: number): string | null {
    const amount = stripNumber(value);

    if (amount === null) {
        return 'Enter the amount you want to bid.';
    }

    return amount < minNext ? `That is too low. Your bid must be at least ${formatRand(minNext)}.` : null;
}

/* ─── Sell at auction questionnaire ─────────────────────────────────── */

export type SellAnswers = {
    seller_type: string;
    spouse_name: string;
    executor_name: string;
    name: string;
    email: string;
    phone: string;
    preferred_contact: string;
    property_type: string;
    address: string;
    suburb: string;
    zoning: string;
    erf_size: string;
    floor_size: string;
    bedrooms: string;
    bathrooms: string;
    features: string[];
    occupancy: string;
    monthly_rent: string;
    condition: string;
    defects: string;
    has_bond: boolean;
    bond_bank: string;
    bond_amount: string;
    bond_arrears: boolean;
    levies: string;
    municipal_valuation: string;
    price_expectation: string;
    auction_format: string;
    reserve: string;
    timing: string;
    viewing: string;
    sale_reason: string;
    documents: string[];
    referral_source: string;
    consent_terms: boolean;
    consent_authorised: boolean;
    consent_processing: boolean;
    marketing_opt_in: boolean;
    website: string;
};

export const SELL_SECTIONS = [
    'About you',
    'The property',
    'Occupancy',
    'Bond & finances',
    'Auction options',
    'Documents',
    'Terms & consent',
] as const;

export const SELL_NUMBER_FIELDS = [
    'erf_size',
    'floor_size',
    'bedrooms',
    'bathrooms',
    'monthly_rent',
    'bond_amount',
    'levies',
    'municipal_valuation',
    'price_expectation',
] as const;

/** Which fields belong to each step; used to jump to the first step with an error. */
export const SELL_SECTION_FIELDS: (keyof SellAnswers)[][] = [
    ['seller_type', 'spouse_name', 'executor_name', 'name', 'email', 'phone', 'preferred_contact'],
    ['property_type', 'address', 'suburb', 'zoning', 'erf_size', 'floor_size', 'bedrooms', 'bathrooms', 'features'],
    ['occupancy', 'monthly_rent', 'condition', 'defects'],
    ['has_bond', 'bond_bank', 'bond_amount', 'bond_arrears', 'levies', 'municipal_valuation', 'price_expectation'],
    ['auction_format', 'reserve', 'timing', 'viewing', 'sale_reason'],
    ['documents', 'referral_source'],
    ['consent_terms', 'consent_authorised', 'consent_processing', 'marketing_opt_in', 'website'],
];

export const initialSellAnswers: SellAnswers = {
    seller_type: 'individual',
    spouse_name: '',
    executor_name: '',
    name: '',
    email: '',
    phone: '',
    preferred_contact: 'phone',
    property_type: 'house',
    address: '',
    suburb: '',
    zoning: '',
    erf_size: '',
    floor_size: '',
    bedrooms: '',
    bathrooms: '',
    features: [],
    occupancy: 'owner',
    monthly_rent: '',
    condition: 'good',
    defects: '',
    has_bond: false,
    bond_bank: '',
    bond_amount: '',
    bond_arrears: false,
    levies: '',
    municipal_valuation: '',
    price_expectation: '',
    auction_format: 'online',
    reserve: 'confidential',
    timing: '1_3_months',
    viewing: 'appointment',
    sale_reason: '',
    documents: [],
    referral_source: '',
    consent_terms: false,
    consent_authorised: false,
    consent_processing: false,
    marketing_opt_in: false,
    website: '',
};

const filled = (value: string) => value.trim() !== '';

export function isSellSectionComplete(index: number, data: SellAnswers): boolean {
    switch (index) {
        case 0:
            return filled(data.name) && filled(data.email) && filled(data.phone);
        case 1:
            return filled(data.address) && filled(data.suburb);
        case 2:
            return filled(data.occupancy) && filled(data.condition) && (data.occupancy !== 'tenant' || filled(data.monthly_rent));
        case 3:
            return !data.has_bond || filled(data.bond_bank);
        case 4:
            return filled(data.auction_format) && filled(data.timing);
        case 5:
            return data.documents.length > 0 || filled(data.referral_source);
        case 6:
            return data.consent_terms && data.consent_authorised && data.consent_processing;
        default:
            return false;
    }
}

/** Index of the first step containing one of the error keys (e.g. "features.0" counts as "features"), or -1. */
export function firstStepWithError(errorKeys: string[]): number {
    const fields = new Set(errorKeys.map((key) => key.split('.')[0]));

    return SELL_SECTION_FIELDS.findIndex((section) => section.some((field) => fields.has(field)));
}

export type SellPayload = Omit<SellAnswers, (typeof SELL_NUMBER_FIELDS)[number]> & Record<(typeof SELL_NUMBER_FIELDS)[number], number | null>;

/** The JSON sent to CoreX /sell: number fields stripped to digits (empty -> null). */
export function sellPayload(data: SellAnswers): SellPayload {
    const payload = { ...data } as unknown as SellPayload;

    for (const field of SELL_NUMBER_FIELDS) {
        payload[field] = stripNumber(data[field]);
    }

    return payload;
}

/** "3-bedroom house in Waterkloof". */
export function sellPreviewTitle(data: Pick<SellAnswers, 'bedrooms' | 'suburb'>, propertyTypeLabel: string): string {
    const bedrooms = stripNumber(data.bedrooms);

    return `${bedrooms !== null ? `${bedrooms}-bedroom ` : ''}${propertyTypeLabel.toLowerCase()}${filled(data.suburb) ? ` in ${data.suburb.trim()}` : ''}`;
}
