import { telHref, useSite, whatsappHref } from '@/lib/site';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { BrandMark } from './site-header';

export default function SiteFooter() {
    const site = useSite();

    const socialLinks = [
        { label: 'Facebook', href: site.facebook_url, icon: Facebook },
        { label: 'Instagram', href: site.instagram_url, icon: Instagram },
        { label: 'LinkedIn', href: site.linkedin_url, icon: Linkedin },
        { label: 'YouTube', href: site.youtube_url, icon: Youtube },
    ].filter((link) => link.href);

    return (
        <footer className="bg-ink text-white/80">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-4">
                    <BrandMark inverted />
                    <p className="text-sm">{site.legal_name}</p>
                    {site.parent_site_url && (
                        <a href={site.parent_site_url} target="_blank" rel="noopener" className="text-brass text-sm hover:underline">
                            {site.parent_site_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </a>
                    )}
                    {socialLinks.length > 0 && (
                        <ul className="flex gap-2">
                            {socialLinks.map(({ label, href, icon: Icon }) => (
                                <li key={label}>
                                    <a
                                        href={href!}
                                        target="_blank"
                                        rel="noopener"
                                        aria-label={label}
                                        className="hover:bg-brass hover:text-ink flex size-9 items-center justify-center rounded-full bg-white/10 transition"
                                    >
                                        <Icon className="size-4" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <h3 className="text-brass mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Visit</h3>
                    <p className="text-sm">{site.address}</p>
                </div>

                <div>
                    <h3 className="text-brass mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Call</h3>
                    <ul className="space-y-1 text-sm">
                        {site.phones.map((phone) => (
                            <li key={phone}>
                                <a href={telHref(phone)} className="hover:text-white">
                                    {phone}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-brass mb-3 text-xs font-semibold tracking-[0.2em] uppercase">
                        {site.whatsapp ? 'WhatsApp & email' : 'Email'}
                    </h3>
                    <ul className="space-y-1 text-sm">
                        {site.whatsapp && (
                            <li>
                                <a href={whatsappHref(site.whatsapp)} target="_blank" rel="noopener" className="hover:text-white">
                                    WhatsApp {site.whatsapp}
                                </a>
                            </li>
                        )}
                        {site.emails.map((email) => (
                            <li key={email}>
                                <a href={`mailto:${email}`} className="hover:text-white">
                                    {email}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/10">
                <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/50 sm:px-6">
                    © {new Date().getFullYear()} {site.legal_name}. Registered with the PPRA. All auctions are conducted in accordance with the
                    Consumer Protection Act 68 of 2008 and its regulations.
                </p>
            </div>
        </footer>
    );
}
