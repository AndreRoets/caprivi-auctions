import { company, telHref } from '@/lib/site';
import { Link } from '@inertiajs/react';
import { Gavel, Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';

export function BrandMark({ inverted = false }: { inverted?: boolean }) {
    return (
        <span className="flex items-center gap-3">
            <span className={`flex size-10 items-center justify-center rounded-full ${inverted ? 'bg-brass text-ink' : 'bg-ink text-brass'}`}>
                <Gavel className="size-5" />
            </span>
            <span className="leading-tight">
                <span className={`font-display block text-lg font-semibold ${inverted ? 'text-white' : 'text-ink'}`}>{company.name}</span>
                <span className={`block text-[11px] tracking-[0.2em] uppercase ${inverted ? 'text-brass' : 'text-brass-dark'}`}>
                    {company.tagline}
                </span>
            </span>
        </span>
    );
}

const navItems = [
    { label: 'Live auctions', href: company.liveAuctionsUrl, external: true },
    { label: 'Property on auction', href: '/on-auction' },
    { label: 'Sell at auction', href: '/#questionnaire' },
    { label: 'Documents', href: '/#documents' },
    { label: 'Questions', href: '/#faq' },
];

export default function SiteHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header id="top" className="border-sand-dark sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
                <Link href="/" aria-label={`${company.name} home`}>
                    <BrandMark />
                </Link>

                <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 lg:flex">
                    {navItems.map((item) =>
                        item.external ? (
                            <a key={item.label} href={item.href} target="_blank" rel="noopener" className="hover:text-brass-dark">
                                {item.label}
                            </a>
                        ) : (
                            <Link key={item.label} href={item.href} className="hover:text-brass-dark">
                                {item.label}
                            </Link>
                        ),
                    )}
                </nav>

                <a
                    href={telHref(company.phones[0])}
                    className="bg-ink hover:bg-ink-soft hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white sm:flex"
                >
                    <Phone className="text-brass size-4" />
                    {company.phones[0]}
                </a>

                <button
                    type="button"
                    className="text-ink rounded-md p-2 lg:hidden"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {menuOpen && (
                <nav className="border-sand-dark border-t bg-white px-4 py-4 lg:hidden">
                    <ul className="text-ink grid gap-1 text-base font-medium">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                {item.external ? (
                                    <a href={item.href} target="_blank" rel="noopener" className="hover:bg-sand block rounded-md px-3 py-2">
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link href={item.href} className="hover:bg-sand block rounded-md px-3 py-2" onClick={() => setMenuOpen(false)}>
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                        <li>
                            <a href={telHref(company.phones[0])} className="text-brass-dark block rounded-md px-3 py-2">
                                Call {company.phones[0]}
                            </a>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
}
