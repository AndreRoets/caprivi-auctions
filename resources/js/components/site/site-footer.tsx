import { company, telHref, whatsappHref } from '@/lib/site';
import { BrandMark } from './site-header';

export default function SiteFooter() {
    return (
        <footer className="bg-ink text-white/80">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-4">
                    <BrandMark inverted />
                    <p className="text-sm">{company.legalName}</p>
                    <a href={company.parentSite} target="_blank" rel="noopener" className="text-brass text-sm hover:underline">
                        capriviproperties.co.za
                    </a>
                </div>

                <div>
                    <h3 className="text-brass mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Visit</h3>
                    <p className="text-sm">{company.address}</p>
                </div>

                <div>
                    <h3 className="text-brass mb-3 text-xs font-semibold tracking-[0.2em] uppercase">Call</h3>
                    <ul className="space-y-1 text-sm">
                        {company.phones.map((phone) => (
                            <li key={phone}>
                                <a href={telHref(phone)} className="hover:text-white">
                                    {phone}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-brass mb-3 text-xs font-semibold tracking-[0.2em] uppercase">WhatsApp &amp; email</h3>
                    <ul className="space-y-1 text-sm">
                        <li>
                            <a href={whatsappHref(company.whatsapp)} target="_blank" rel="noopener" className="hover:text-white">
                                WhatsApp {company.whatsapp}
                            </a>
                        </li>
                        {company.emails.map((email) => (
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
                    © {new Date().getFullYear()} {company.legalName}. Registered with the PPRA. All auctions are conducted in accordance with the
                    Consumer Protection Act 68 of 2008 and its regulations.
                </p>
            </div>
        </footer>
    );
}
