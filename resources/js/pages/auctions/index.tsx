import { AuctionCard } from '@/components/auctions/auction-card';
import SellerQuestionnaireSection from '@/components/site/seller-questionnaire-section';
import SiteLayout from '@/layouts/site-layout';
import { telHref, useSite } from '@/lib/site';
import { type SharedData } from '@/types';
import { type AuctionCard as AuctionCardData, type CorexSite } from '@/types/corex';
import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface AuctionsIndexProps {
    corexSite: CorexSite | null;
    liveAuctions: AuctionCardData[];
    upcomingAuctions: AuctionCardData[];
    pastAuctions: AuctionCardData[];
}

const defaultSteps = [
    { title: 'Create a free account', body: 'Sign up with your email address. It takes a minute and costs nothing.' },
    { title: 'Register and upload documents', body: 'Choose an auction, register to bid and upload your FICA documents for approval.' },
    { title: 'Bid once approved', body: 'When the auctioneer approves you, you get a bidder number and can bid online.' },
];

function Rooftops() {
    return (
        <svg
            className="text-brass/10 pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
            viewBox="0 0 1200 96"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="M0 96V62l40-30 40 30V50h30V34l50-34 50 34v30h26l38-26 38 26V56h34V30l46-30 46 30v38h28l34-22 34 22V52h40V28l52-28 52 28v40h30l36-24 36 24V58h32V34l48-30 48 30v28h26l40-28 40 28v34z"
            />
        </svg>
    );
}

function AuctionSection({
    id,
    title,
    intro,
    auctions,
    viewAllHref,
    children,
}: {
    id: string;
    title: string;
    intro?: string;
    auctions: AuctionCardData[];
    viewAllHref?: string;
    children?: ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-20 py-16" aria-labelledby={`${id}-heading`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <h2 id={`${id}-heading`} className="font-display text-ink text-3xl">
                    {title}
                </h2>
                {intro && <p className="mt-2 text-slate-600">{intro}</p>}
                {viewAllHref && auctions.length > 0 && (
                    <Link href={viewAllHref} className="text-brass-dark mt-2 inline-flex min-h-11 items-center font-medium hover:underline">
                        View all upcoming auctions →
                    </Link>
                )}
                {auctions.length > 0 ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {auctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))}
                    </div>
                ) : (
                    children
                )}
            </div>
        </section>
    );
}

export default function AuctionsIndex({ corexSite, liveAuctions, upcomingAuctions, pastAuctions }: AuctionsIndexProps) {
    const { buyer, sellEnabled } = usePage<SharedData>().props;
    const site = useSite();
    const liveLots = liveAuctions.reduce((total, auction) => total + (auction.lots_count ?? 0), 0);
    const heroImage = corexSite?.site.hero_image_url;
    const steps = corexSite?.site.how_it_works
        ? corexSite.site.how_it_works
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
        : null;

    return (
        <SiteLayout>
            <section className="bg-ink relative overflow-hidden text-white">
                {heroImage ? (
                    <>
                        <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />
                        <div className="bg-ink/75 absolute inset-0" />
                    </>
                ) : (
                    <>
                        <div className="bg-brass/20 pointer-events-none absolute -top-24 -right-24 size-96 rounded-full blur-3xl" />
                        <Rooftops />
                    </>
                )}
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
                    {liveAuctions.length > 0 && (
                        <a
                            href="#live"
                            className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold text-emerald-200"
                        >
                            <span className="size-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
                            An auction is live now
                        </a>
                    )}
                    <h1 className="font-display max-w-3xl text-4xl leading-tight sm:text-5xl">{corexSite?.site.title || 'Property auctions'}</h1>
                    {corexSite?.site.intro && <p className="mt-5 max-w-2xl text-lg whitespace-pre-line text-white/75">{corexSite.site.intro}</p>}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {buyer ? (
                            <Link
                                href="/account"
                                className="bg-brass text-ink inline-flex min-h-11 items-center rounded-full px-6 font-medium hover:bg-white"
                            >
                                My account
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/account/signup?return=/auctions"
                                    className="bg-brass text-ink inline-flex min-h-11 items-center rounded-full px-6 font-medium hover:bg-white"
                                >
                                    Sign up to bid
                                </Link>
                                <Link
                                    href="/account/login?return=/auctions"
                                    className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-6 font-medium hover:bg-white/10"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                        {sellEnabled && (
                            <a
                                href="#questionnaire"
                                className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-6 font-medium hover:bg-white/10"
                            >
                                Sell your property at auction
                            </a>
                        )}
                    </div>
                    {corexSite && (
                        <p className="mt-8 text-sm text-white/60">
                            {liveAuctions.length} {liveAuctions.length === 1 ? 'auction' : 'auctions'} open now · {liveLots}{' '}
                            {liveLots === 1 ? 'lot' : 'lots'} to bid on · {upcomingAuctions.length} coming up
                        </p>
                    )}
                </div>
            </section>

            {!corexSite ? (
                <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
                    <h2 className="font-display text-ink text-2xl">Auctions are temporarily unavailable</h2>
                    <p className="mt-3 text-slate-600">
                        Please try again in a few minutes, or call us on{' '}
                        <a href={telHref(site.main_phone)} className="text-brass-dark font-medium underline">
                            {site.main_phone}
                        </a>
                        .
                    </p>
                </section>
            ) : (
                <>
                    <AuctionSection id="live" title="Live now" auctions={liveAuctions}>
                        <p className="mt-4 text-slate-600">No auctions are open for bidding right now. See what is coming up below.</p>
                    </AuctionSection>

                    <AuctionSection id="upcoming" title="Coming up" auctions={upcomingAuctions} viewAllHref="/auctions/upcoming">
                        <p className="mt-4 text-slate-600">New auctions are announced here. Create a free account so you are ready to register.</p>
                    </AuctionSection>

                    <section className="bg-white py-16" aria-labelledby="how-heading">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6">
                            <h2 id="how-heading" className="font-display text-ink text-3xl">
                                How bidding works
                            </h2>
                            {steps ? (
                                <div className="mt-6 max-w-3xl space-y-4 text-slate-700">
                                    {steps.map((paragraph, index) => (
                                        <p key={index} className="whitespace-pre-line">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <ol className="mt-8 grid gap-6 md:grid-cols-3">
                                    {defaultSteps.map((step, index) => (
                                        <li key={step.title} className="border-sand-dark rounded-2xl border p-6">
                                            <span className="bg-brass font-display text-ink flex size-10 items-center justify-center rounded-full">
                                                {index + 1}
                                            </span>
                                            <p className="text-ink mt-4 font-semibold">{step.title}</p>
                                            <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    </section>

                    {pastAuctions.length > 0 && <AuctionSection id="past" title="Past auctions" auctions={pastAuctions} />}

                    <SellerQuestionnaireSection corexSite={corexSite} className="bg-white" />
                </>
            )}
        </SiteLayout>
    );
}
