export const company = {
    name: 'Caprivi Auctions',
    tagline: 'Smart Bid. Smart Buy.',
    legalName: 'Caprivi Properties (Pty) Ltd t/a Caprivi Auctions & Bids',
    parentSite: 'https://capriviproperties.co.za',
    address: '70 Commissioner Street, Kempton Park, Gauteng',
    phones: ['010 001 9469', '010 495 6216', '082 348 4595'],
    whatsapp: '068 452 2930',
    emails: ['info@capriviauctions.co.za', 'sales@capriviauctions.co.za'],
    liveAuctionsUrl: 'https://bidpro.co.za',
};

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
