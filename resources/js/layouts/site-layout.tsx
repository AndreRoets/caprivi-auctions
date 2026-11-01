import ContactModal from '@/components/site/contact-modal';
import Seo from '@/components/site/seo';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { createContext, ReactNode, useContext, useState } from 'react';

interface ContactContextValue {
    openContact: () => void;
}

const ContactContext = createContext<ContactContextValue>({ openContact: () => {} });

export function useContactModal(): ContactContextValue {
    return useContext(ContactContext);
}

function FlashBanner() {
    const { flash } = usePage<SharedData>().props;

    if (!flash.success) {
        return null;
    }

    return (
        <div role="status" className="border-b border-emerald-200 bg-emerald-50 text-emerald-900">
            <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-sm sm:px-6">
                <CheckCircle2 className="size-4 shrink-0" /> {flash.success}
            </p>
        </div>
    );
}

export default function SiteLayout({ children }: { children: ReactNode }) {
    const { contactSubjects } = usePage<SharedData>().props;
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <ContactContext.Provider value={{ openContact: () => setContactOpen(true) }}>
            <div className="bg-sand text-ink flex min-h-screen flex-col font-sans antialiased">
                <Seo />
                <SiteHeader />
                <FlashBanner />
                <main className="flex-1">{children}</main>
                <SiteFooter />
            </div>
            <ContactModal open={contactOpen} onOpenChange={setContactOpen} subjects={contactSubjects} />
        </ContactContext.Provider>
    );
}
