/** Shapes returned by the CoreX website auctions API (only the fields this site uses). */

export type Options = Record<string, string>;

export interface CorexSite {
    agency: { slug?: string; name: string; logo_url: string | null; email: string | null; phone: string | null };
    site: {
        title: string | null;
        intro: string | null;
        hero_image_url: string | null;
        how_it_works: string | null;
        footer_text: string | null;
        contact_email: string | null;
        contact_phone: string | null;
        show_past_auctions: boolean;
        currency: string;
        public_page_url: string | null;
    };
    colors: { brand: string; on_brand: string; button: string; on_button: string };
    features: { seller_questionnaire: boolean; bidding_activity: boolean; bidder_numbers_visible: boolean };
    seller_questionnaire: SellerQuestionnaireOptions | null;
}

export interface SellerQuestionnaireOptions {
    response_text: string | null;
    seller_types: Options;
    property_types: Options;
    auction_formats: Options;
    contact_methods: Options;
    features: Options;
    occupancy: Options;
    conditions: Options;
    reserve: Options;
    timing: Options;
    viewing: Options;
    documents: Options;
}

export type AuctionPhase = 'live' | 'upcoming' | 'finished';

export interface AuctionCard {
    id: number | string;
    reference: string | null;
    title: string;
    phase: AuctionPhase;
    phase_label: string | null;
    status: string | null;
    format: 'timed' | 'live';
    starts_at: string | null;
    ends_at: string | null;
    venue_name: string | null;
    lots_count: number | null;
    image_url: string | null;
    public_page_url: string | null;
}

export interface CorexDocument {
    id: number | string;
    name: string;
    download?: unknown;
}

export interface LotCard {
    id: number | string;
    auction_id: number | string;
    lot_number: string | number | null;
    title: string;
    status: string | null;
    suburb: string | null;
    city: string | null;
    opening_bid: number | null;
    guide_price_min: number | null;
    guide_price_max: number | null;
    image_url: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    garages: number | null;
}

export interface AuctionDetail extends AuctionCard {
    description: string | null;
    venue_address: string | null;
    stream_url: string | null;
    registration: { open: boolean; closes_at: string | null; mine: Registration | null } | null;
    fee_notice: string | null;
    documents: CorexDocument[];
    hidden_documents: number | null;
    lots: LotCard[];
}

export type RegistrationStatus = 'pending' | 'approved' | 'declined' | string;

export interface Registration {
    id?: number | string;
    auction_id?: number | string;
    status: RegistrationStatus;
    bidder_type?: string | null;
    bidder_number?: string | number | null;
    declined_reason?: string | null;
    auction?: { id: number | string; title: string; reference: string | null };
}

export interface RecentBid {
    amount: number;
    who: string | number | null;
    at: string;
    highest: boolean;
    mine: boolean;
}

export interface Bidding {
    lot_status: string | null;
    phase: 'upcoming' | 'open' | 'ended';
    server_now: string;
    opens_at: string | null;
    closes_at: string | null;
    seconds_left: number | null;
    current_bid: number | null;
    opening_bid: number | null;
    min_next: number;
    increment: number;
    reserve: 'met' | 'not_met' | null;
    you: 'winning' | 'outbid' | 'none' | null;
    currency: string;
    bid_count?: number;
    recent_bids?: RecentBid[];
    leader_number?: string | number | null;
    your_auto_bid: number | null;
}

export interface LiveLotState {
    bidding: Bidding;
    my_registration: Registration | null;
    watching: boolean;
}

export type Photo =
    | string
    | { url?: string; src?: string; large?: string; original?: string; thumb?: string; thumbnail_url?: string; caption?: string };

export interface LotDetail extends LotCard, LiveLotState {
    description: string | null;
    floor_size_m2: number | null;
    photos: Photo[];
    documents: CorexDocument[];
    hidden_documents: number | null;
    auction: {
        id: number | string;
        title: string;
        reference: string | null;
        format: 'timed' | 'live';
        phase: AuctionPhase;
        registration_open: boolean;
    };
    fee_notice: string | null;
}

export interface RegistrationForm {
    open: boolean;
    closes_at: string | null;
    registration: Registration | null;
    required_documents: { individual: { kind: string; label: string }[]; company: { kind: string; label: string }[] };
    on_file: Record<string, { id: number | string; name: string; uploaded_at: string | null }[]>;
    conditions_text: string | null;
    fee_notice: string | null;
}

export interface Invoice {
    id: number | string;
    number: string;
    status: string;
    total_amount: number | null;
    deposit_amount: number | null;
    deposit_due_at: string | null;
    balance_amount: number | null;
    balance_due_at: string | null;
    lot: { title?: string; lot_number?: string | number } | null;
    auction: { title?: string; reference?: string } | null;
}

export interface BuyerAccount {
    buyer: { email: string; name: string; phone: string | null };
    registrations: Registration[];
    lots_won: (LotCard & { hammer_price: number | null; sold_subject_to_confirmation: boolean; result_at: string | null })[];
    watching: LotCard[];
    invoices: Invoice[];
}
