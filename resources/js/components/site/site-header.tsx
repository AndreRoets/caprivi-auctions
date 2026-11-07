import { telHref, useSite } from '@/lib/site';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Phone, UserRound, X } from 'lucide-react';
import { useState } from 'react';

export function BrandMark({ inverted = false }: { inverted?: boolean }) {
    const site = useSite();

    return (
        <span className="flex items-center gap-3">
            <img src="/images/caprivi-logo.png" alt="" className="size-11 shrink-0" />
            <span className="leading-tight">
                <span className={`font-display block text-lg font-semibold ${inverted ? 'text-white' : 'text-ink'}`}>{site.company_name}</span>
                <span className={`block text-[11px] tracking-[0.2em] uppercase ${inverted ? 'text-brass' : 'text-brass-dark'}`}>{site.tagline}</span>
            </span>
        </span>
    );
}

function useNavItems() {
    const { sellEnabled } = usePage<SharedData>().props;

    return [
        { label: 'Auctions', href: '/auctions' },
        { label: 'Upcoming', href: '/auctions/upcoming' },
        ...(sellEnabled ? [{ label: 'Sell at auction', href: '/#questionnaire' }] : []),
        { label: 'Documents', href: '/#documents' },
        { label: 'Questions', href: '/#faq' },
    ];
}

function returnQuery(): string {
    return typeof window === 'undefined' ? '' : `?return=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

function AccountLinks({ onNavigate, stacked = false }: { onNavigate?: () => void; stacked?: boolean }) {
    const { buyer } = usePage<SharedData>().props;
    const linkClass = stacked
        ? 'hover:bg-sand block min-h-11 rounded-md px-3 py-2.5 text-left'
        : 'hover:text-brass-dark inline-flex min-h-11 items-center';

    if (buyer) {
        return (
            <>
                <Link href="/account" className={`${linkClass} gap-1.5`} onClick={onNavigate}>
                    {!stacked && <UserRound className="size-4" />} My account
                </Link>
                <Link href="/account/logout" method="post" as="button" className={`${linkClass} w-full sm:w-auto`} onClick={onNavigate}>
                    Log out
                </Link>
            </>
        );
    }

    return (
        <>
            <Link href={`/account/login${returnQuery()}`} className={linkClass} onClick={onNavigate}>
                Log in
            </Link>
            <Link
                href={`/account/signup${returnQuery()}`}
                className={
                    stacked
                        ? linkClass
                        : 'border-ink text-ink hover:bg-ink inline-flex min-h-11 items-center rounded-full border px-4 hover:text-white'
                }
                onClick={onNavigate}
            >
                Sign up
            </Link>
        </>
    );
}

export default function SiteHeader() {
    const site = useSite();
    const links = useNavItems();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header id="top" className="border-sand-dark sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
                <Link href="/" aria-label={`${site.company_name} home`}>
                    <BrandMark />
                </Link>

                <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-slate-700 lg:flex">
                    {links.map((item) => (
                        <Link key={item.label} href={item.href} className="hover:text-brass-dark">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-4 text-sm font-medium text-slate-700 lg:flex">
                    <AccountLinks />
                    <a
                        href={telHref(site.main_phone)}
                        className="bg-ink hover:bg-ink-soft flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-white"
                    >
                        <Phone className="text-brass size-4" />
                        {site.main_phone}
                    </a>
                </div>

                <button
                    type="button"
                    className="text-ink flex size-11 items-center justify-center rounded-md lg:hidden"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {menuOpen && (
                <nav aria-label="Main" className="border-sand-dark border-t bg-white px-4 py-4 lg:hidden">
                    <ul className="text-ink grid gap-1 text-base font-medium">
                        {links.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="hover:bg-sand block min-h-11 rounded-md px-3 py-2.5"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                        <li className="border-sand-dark grid gap-1 border-t pt-2">
                            <AccountLinks stacked onNavigate={() => setMenuOpen(false)} />
                        </li>
                        <li>
                            <a href={telHref(site.main_phone)} className="text-brass-dark block min-h-11 rounded-md px-3 py-2.5">
                                Call {site.main_phone}
                            </a>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
}
