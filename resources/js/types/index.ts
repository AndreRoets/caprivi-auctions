import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: { success: string | null };
    [key: string]: unknown;
}

export type LotStatus = 'upcoming' | 'open' | 'closed' | 'sold';

export interface Lot {
    id: number;
    web_ref: string;
    slug: string;
    title: string;
    summary: string;
    description: string;
    property_type: string;
    province: string;
    city: string;
    suburb: string;
    address: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    garages: number | null;
    erf_size: number | null;
    floor_size: number | null;
    opening_bid: number;
    monthly_rates: number | null;
    monthly_levies: number | null;
    auction_type: string;
    status: LotStatus;
    auctioneer: string;
    bidding_opens_at: string | null;
    bidding_closes_at: string | null;
    bid_url: string | null;
    image_url: string | null;
    features: string[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
