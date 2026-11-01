import { type SharedData, type SiteSettings } from '@/types';
import { usePage } from '@inertiajs/react';

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

const randFormatter = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 });

export function formatRand(amount: number): string {
    return randFormatter.format(amount).replace('ZAR', 'R');
}

export function formatDateTime(iso: string | null): string {
    if (!iso) {
        return 'To be confirmed';
    }

    return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export const auctionTypeLabels: Record<string, string> = {
    online: 'Online auction',
    live: 'Live auction',
    hybrid: 'Hybrid auction',
    tender: 'Sealed tender',
};

export const statusLabels: Record<string, string> = {
    upcoming: 'Coming soon',
    open: 'Bidding open',
    closed: 'Bidding closed',
    sold: 'Sold',
};
