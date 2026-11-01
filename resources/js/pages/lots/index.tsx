import { inputClass } from '@/components/site/form-field';
import LotCard from '@/components/site/lot-card';
import SiteLayout, { useContactModal } from '@/layouts/site-layout';
import { company, telHref, whatsappHref } from '@/lib/site';
import { type Lot } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

interface LotsIndexProps {
    lots: Lot[];
    filters: { province: string; type: string };
    provinces: string[];
    propertyTypes: string[];
    contactSubjects: string[];
}

function applyFilters(filters: { province: string; type: string }) {
    const query = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
    router.get(route('lots.index'), query, { preserveState: true, preserveScroll: true, replace: true });
}

function AgentPanel() {
    const { openContact } = useContactModal();

    return (
        <section id="agent" className="scroll-mt-20 bg-white py-16">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
                <div>
                    <p className="text-brass-dark text-xs font-semibold tracking-[0.2em] uppercase">Viewings & enquiries</p>
                    <h2 className="font-display text-ink mt-2 text-3xl">Talk to the auctions office</h2>
                    <p className="mt-3 text-slate-600">
                        Viewings are by appointment. To bid you'll need to register beforehand and submit your FICA documents – we'll guide you
                        through it.
                    </p>
                    <button
                        type="button"
                        onClick={openContact}
                        className="bg-ink hover:bg-ink-soft mt-6 rounded-full px-6 py-3 font-medium text-white"
                    >
                        Send an enquiry
                    </button>
                </div>
                <ul className="grid gap-3 text-sm">
                    <li>
                        <a href={telHref(company.phones[2])} className="border-sand-dark hover:bg-sand flex items-center gap-3 rounded-xl border p-4">
                            <Phone className="text-brass-dark size-5" /> Mobile: {company.phones[2]}
                        </a>
                    </li>
                    <li>
                        <a href={telHref(company.phones[0])} className="border-sand-dark hover:bg-sand flex items-center gap-3 rounded-xl border p-4">
                            <Phone className="text-brass-dark size-5" /> Auctions office: {company.phones[0]}
                        </a>
                    </li>
                    <li>
                        <a
                            href={whatsappHref(company.whatsapp)}
                            target="_blank"
                            rel="noopener"
                            className="border-sand-dark hover:bg-sand flex items-center gap-3 rounded-xl border p-4"
                        >
                            <MessageCircle className="text-brass-dark size-5" /> WhatsApp: {company.whatsapp}
                        </a>
                    </li>
                    <li>
                        <a
                            href={`mailto:${company.emails[0]}`}
                            className="border-sand-dark hover:bg-sand flex items-center gap-3 rounded-xl border p-4"
                        >
                            <Mail className="text-brass-dark size-5" /> {company.emails[0]}
                        </a>
                    </li>
                    <li className="border-sand-dark flex items-center gap-3 rounded-xl border p-4">
                        <MapPin className="text-brass-dark size-5" /> {company.address}
                    </li>
                </ul>
            </div>
        </section>
    );
}

export default function LotsIndex({ lots, filters, provinces, propertyTypes, contactSubjects }: LotsIndexProps) {
    const countsByProvince = lots.reduce<Record<string, number>>((counts, lot) => {
        counts[lot.province] = (counts[lot.province] ?? 0) + 1;

        return counts;
    }, {});

    return (
        <SiteLayout contactSubjects={contactSubjects}>
            <Head title="Property on auction" />

            <section className="bg-ink text-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <p className="text-brass text-xs font-semibold tracking-[0.25em] uppercase">On auction now</p>
                    <h1 className="font-display mt-3 text-4xl sm:text-5xl">Property on auction</h1>
                    <p className="mt-4 max-w-2xl text-white/70">
                        Browse current and upcoming lots. Register as a bidder ahead of time so you're ready when bidding opens.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <a
                            href={company.liveAuctionsUrl}
                            target="_blank"
                            rel="noopener"
                            className="bg-brass text-ink rounded-full px-6 py-3 font-medium hover:bg-white"
                        >
                            Register to bid
                        </a>
                        <a href="#agent" className="rounded-full border border-white/30 px-6 py-3 font-medium hover:bg-white/10">
                            Book a viewing
                        </a>
                    </div>
                </div>
            </section>

            <section id="listings" className="scroll-mt-20 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="border-sand-dark flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4">
                        <label className="grid min-w-48 flex-1 gap-1 text-sm">
                            <span className="font-medium text-slate-700">Province</span>
                            <select
                                className={inputClass}
                                value={filters.province}
                                onChange={(e) => applyFilters({ ...filters, province: e.target.value })}
                            >
                                <option value="">All provinces</option>
                                {provinces.map((province) => (
                                    <option key={province}>{province}</option>
                                ))}
                            </select>
                        </label>
                        <label className="grid min-w-48 flex-1 gap-1 text-sm">
                            <span className="font-medium text-slate-700">Property type</span>
                            <select className={inputClass} value={filters.type} onChange={(e) => applyFilters({ ...filters, type: e.target.value })}>
                                <option value="">All property types</option>
                                {propertyTypes.map((type) => (
                                    <option key={type}>{type}</option>
                                ))}
                            </select>
                        </label>
                        <Link
                            href={route('lots.index')}
                            className="text-brass-dark hover:bg-sand rounded-lg px-4 py-2.5 text-sm font-medium"
                            preserveScroll
                        >
                            Clear
                        </Link>
                    </div>

                    {Object.keys(countsByProvince).length > 0 && (
                        <div className="mt-6">
                            <h2 className="mb-3 text-sm font-medium text-slate-700">Where the properties are</h2>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(countsByProvince).map(([province, count]) => (
                                    <button
                                        key={province}
                                        type="button"
                                        onClick={() => applyFilters({ ...filters, province })}
                                        className="ring-sand-dark hover:ring-brass flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-xs ring-1"
                                    >
                                        <MapPin className="text-brass-dark size-4" />
                                        {province}
                                        <span className="bg-sand rounded-full px-2 text-xs">{count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {lots.length > 0 ? (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {lots.map((lot) => (
                                <LotCard key={lot.id} lot={lot} />
                            ))}
                        </div>
                    ) : (
                        <div className="border-sand-dark mt-8 rounded-2xl border border-dashed bg-white p-12 text-center">
                            <p className="font-display text-ink text-xl">No lots match these filters</p>
                            <p className="mt-2 text-sm text-slate-600">Try clearing the filters, or check back soon for new auctions.</p>
                        </div>
                    )}
                </div>
            </section>

            <AgentPanel />

            <section className="bg-brass">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
                    <p className="font-display text-ink text-2xl">Have a property to sell?</p>
                    <Link href="/#questionnaire" className="bg-ink hover:bg-ink-soft rounded-full px-6 py-3 font-medium text-white">
                        Start the seller questionnaire
                    </Link>
                </div>
            </section>
        </SiteLayout>
    );
}
