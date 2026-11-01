import { AuctionCard } from '@/components/auctions/auction-card';
import CommissionCalculator from '@/components/site/commission-calculator';
import FaqList from '@/components/site/faq-list';
import SellerQuestionnaireSection from '@/components/site/seller-questionnaire-section';
import SiteLayout, { useContactModal } from '@/layouts/site-layout';
import { telHref, useSite } from '@/lib/site';
import { type SharedData } from '@/types';
import { type AuctionCard as AuctionCardData, type CorexSite } from '@/types/corex';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, FileText, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { ReactNode } from 'react';

interface WelcomeProps {
    corexSite: CorexSite | null;
    liveAuctions: AuctionCardData[];
    upcomingAuctions: AuctionCardData[];
}

const steps = [
    { title: 'Questionnaire & valuation', body: 'Tell us about the property online. We prepare a free valuation and auction proposal.' },
    { title: 'Sign the mandate', body: 'Agree on the auction date, format, reserve and commission before anything is advertised.' },
    { title: 'Targeted marketing', body: 'Your lot is photographed, catalogued and promoted to our registered buyer database.' },
    { title: 'Auction day', body: 'Qualified bidders compete openly online, on site or both – the market sets the price.' },
    { title: 'Confirmation & transfer', body: 'Once the sale is confirmed, conveyancers handle transfer and you receive your proceeds.' },
];

const benefits = [
    { icon: CalendarClock, title: 'A fixed sale date', body: 'No open-ended listing. You know exactly when the property will be sold.' },
    {
        icon: TrendingUp,
        title: 'Competitive bidding',
        body: 'Buyers bid against each other in real time, which drives the price to true market value.',
    },
    { icon: FileText, title: 'Your conditions', body: 'Conditions of sale are set up front, so buyers commit on terms you have already approved.' },
    {
        icon: ShieldCheck,
        title: 'Reserve protection',
        body: 'A confidential reserve means the property never sells for less than you are prepared to accept.',
    },
];

const documents = [
    { title: 'Property report', type: 'Per lot', note: 'Issued with each catalogue' },
    { title: 'Conditions of sale', type: 'PDF', note: 'Terms every buyer accepts' },
    { title: 'Rules of auction', type: 'PDF', note: 'How bidding is conducted' },
    { title: 'Offer to purchase & sale mandate', type: 'PDF', note: 'Seller appointment documents' },
    { title: 'Commission agreement', type: 'PDF', note: 'Seller and buyer commission terms' },
    { title: 'Bidder registration form', type: 'PDF', note: 'Required with FICA documents' },
];

const accreditations = [
    { name: 'PPRA', body: 'Registered with the Property Practitioners Regulatory Authority.' },
    { name: 'SAPOA', body: 'Member of the South African Property Owners Association.' },
    { name: 'SAIA', body: 'Affiliated with the South African Institute of Auctioneers.' },
];

function Section({
    id,
    eyebrow,
    title,
    intro,
    children,
    className,
}: {
    id?: string;
    eyebrow: string;
    title: string;
    intro?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section id={id} className={`scroll-mt-20 py-20 ${className ?? ''}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-10 max-w-2xl">
                    <p className="text-brass-dark text-xs font-semibold tracking-[0.2em] uppercase">{eyebrow}</p>
                    <h2 className="font-display text-ink mt-2 text-3xl sm:text-4xl">{title}</h2>
                    {intro && <p className="mt-3 text-slate-600">{intro}</p>}
                </div>
                {children}
            </div>
        </section>
    );
}

function Hero() {
    const { openContact } = useContactModal();
    const { sellEnabled } = usePage<SharedData>().props;

    return (
        <section className="bg-ink relative overflow-hidden text-white">
            <div className="bg-brass/20 pointer-events-none absolute -top-24 -right-24 size-96 rounded-full blur-3xl" />
            <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:py-28">
                <div>
                    <p className="text-brass text-xs font-semibold tracking-[0.25em] uppercase">Property auctions · Gauteng & beyond</p>
                    <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
                        Sell your property on <em className="text-brass">your</em> timeline, at the price the market will pay.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-white/75">
                        Complete our short seller questionnaire and an auctioneer will come back to you with a free valuation and a tailored auction
                        plan – online, live, hybrid or sealed tender.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        {sellEnabled ? (
                            <a
                                href="#questionnaire"
                                className="bg-brass text-ink hover:bg-brass-dark inline-flex min-h-11 items-center rounded-full px-6 font-medium transition hover:text-white"
                            >
                                Start the seller questionnaire
                            </a>
                        ) : (
                            <Link
                                href="/auctions"
                                className="bg-brass text-ink hover:bg-brass-dark inline-flex min-h-11 items-center rounded-full px-6 font-medium transition hover:text-white"
                            >
                                View auctions
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={openContact}
                            className="rounded-full border border-white/30 px-6 py-3 font-medium hover:bg-white/10"
                        >
                            Speak to an auctioneer
                        </button>
                    </div>
                    <p className="mt-5 text-sm text-white/50">Takes about 8 minutes · No obligation to sell</p>
                </div>

                <ol className="space-y-4 self-center">
                    {steps.map((step, index) => (
                        <li key={step.title} className="flex gap-4 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                            <span className="bg-brass font-display text-ink flex size-9 shrink-0 items-center justify-center rounded-full">
                                {index + 1}
                            </span>
                            <div>
                                <p className="font-medium">{step.title}</p>
                                <p className="text-sm text-white/60">{step.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

function AuctionsTeaser({ liveAuctions, upcomingAuctions }: { liveAuctions: AuctionCardData[]; upcomingAuctions: AuctionCardData[] }) {
    const auctions = [...liveAuctions, ...upcomingAuctions].slice(0, 3);

    if (auctions.length === 0) {
        return null;
    }

    return (
        <Section
            id="auctions"
            eyebrow={liveAuctions.length > 0 ? 'Live now' : 'Coming up'}
            title={liveAuctions.length > 0 ? 'Auctions open for bidding' : 'Upcoming auctions'}
            intro="Create a free account, register for an auction and bid online once you are approved."
        >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {auctions.map((auction) => (
                    <AuctionCard key={auction.id} auction={auction} />
                ))}
            </div>
            <Link href="/auctions" className="text-brass-dark mt-8 inline-flex min-h-11 items-center font-medium hover:underline">
                See all auctions →
            </Link>
        </Section>
    );
}

function Documents() {
    const { openContact } = useContactModal();

    return (
        <Section
            id="documents"
            eyebrow="Auction documents"
            title="Everything in writing, before you bid"
            intro="Request any of the standard documents below and we will send the latest version, along with the property report for the lot you are interested in."
            className="bg-white"
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                    <div key={doc.title} className="border-sand-dark flex items-start gap-4 rounded-2xl border p-5">
                        <span className="bg-sand text-brass-dark flex size-11 shrink-0 items-center justify-center rounded-xl">
                            <FileText className="size-5" />
                        </span>
                        <div className="flex-1">
                            <p className="text-ink font-medium">{doc.title}</p>
                            <p className="text-xs text-slate-500">
                                {doc.type} · {doc.note}
                            </p>
                            <button type="button" onClick={openContact} className="text-brass-dark mt-2 text-sm font-medium hover:underline">
                                Request document
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
}

export default function Welcome({ corexSite, liveAuctions, upcomingAuctions }: WelcomeProps) {
    const site = useSite();
    const hasAuctions = liveAuctions.length + upcomingAuctions.length > 0;

    return (
        <SiteLayout>
            <Hero />

            <AuctionsTeaser liveAuctions={liveAuctions} upcomingAuctions={upcomingAuctions} />

            <Section eyebrow="Why auction" title="Why sellers choose auction" className={hasAuctions ? 'pt-0' : ''}>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="border-sand-dark rounded-2xl border bg-white p-6">
                            <Icon className="text-brass-dark size-7" />
                            <h3 className="font-display text-ink mt-4 text-xl">{title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{body}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <SellerQuestionnaireSection corexSite={corexSite} />

            <Documents />

            <Section
                id="commission"
                eyebrow="Commission"
                title="See how the numbers work"
                intro="Adjust the hammer price and commission rates to see a simple breakdown for both seller and buyer."
            >
                <CommissionCalculator />
            </Section>

            <Section id="faq" eyebrow="Questions" title="Seller FAQ" className="bg-white">
                <div className="max-w-3xl">
                    <FaqList />
                </div>
            </Section>

            <section className="border-sand-dark border-t py-14">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6">
                    {accreditations.map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                            <span className="bg-ink font-display text-brass flex size-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                                {item.name}
                            </span>
                            <p className="text-sm text-slate-600">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-brass">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
                    <p className="font-display text-ink flex items-center gap-3 text-2xl">
                        <Users className="size-7" /> Prefer to talk it through?
                    </p>
                    <a href={telHref(site.main_phone)} className="bg-ink hover:bg-ink-soft rounded-full px-6 py-3 font-medium text-white">
                        Call {site.main_phone}
                    </a>
                </div>
            </section>
        </SiteLayout>
    );
}
