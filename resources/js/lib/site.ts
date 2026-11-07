import { type SharedData, type SiteSettings } from '@/types';
import { usePage } from '@inertiajs/react';

export { formatDate, formatDateTime, formatRand } from './corex';

/** Contact details and links managed from the admin "Website details" screen. */
export function useSite(): SiteSettings {
    return usePage<SharedData>().props.site;
}

export function telHref(phone: string): string {
    return `tel:${phone.replace(/\s+/g, '')}`;
}

export function whatsappHref(phone: string): string {
    return `https://wa.me/27${phone.replace(/\s+/g, '').replace(/^0/, '')}`;
}

/** Reads Laravel's XSRF cookie so fetch() calls pass CSRF protection. */
export function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/**
 * JSON call to this website's own endpoints (never to CoreX directly).
 * Resolves with the parsed body; rejects with { status, message, errors, loginUrl }.
 */
export async function siteFetch<T>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const response = await fetch(url, {
        method: init.method ?? 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(init.method && init.method !== 'GET' ? { 'X-XSRF-TOKEN': xsrfToken() } : {}),
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errors: Record<string, string[]> = body.errors ?? {};
        const firstError = Object.values(errors)[0]?.[0];

        throw {
            status: response.status,
            message:
                response.status === 429
                    ? 'Too many attempts, please wait a minute.'
                    : (firstError ?? body.message ?? 'Something went wrong. Please try again.'),
            errors,
            loginUrl: body.login_url as string | undefined,
            data: body.data,
        } satisfies SiteFetchError;
    }

    return body as T;
}

export interface SiteFetchError {
    status: number;
    message: string;
    errors: Record<string, string[]>;
    loginUrl?: string;
    /** The fresh live state CoreX sends with a refused bid. */
    data?: unknown;
}
