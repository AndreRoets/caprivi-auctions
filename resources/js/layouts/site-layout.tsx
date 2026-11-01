import ContactModal from '@/components/site/contact-modal';
import Seo from '@/components/site/seo';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';
import { createContext, ReactNode, useContext, useState } from 'react';

interface ContactContextValue {
    openContact: () => void;
}

const ContactContext = createContext<ContactContextValue>({ openContact: () => {} });

export function useContactModal(): ContactContextValue {
    return useContext(ContactContext);
}

interface SiteLayoutProps {
    children: ReactNode;
    contactSubjects: string[];
    lotId?: number;
}

export default function SiteLayout({ children, contactSubjects, lotId }: SiteLayoutProps) {
    const [contactOpen, setContactOpen] = useState(false);

    return (
        <ContactContext.Provider value={{ openContact: () => setContactOpen(true) }}>
            <div className="bg-sand text-ink min-h-screen font-sans antialiased">
                <Seo />
                <SiteHeader />
                <main>{children}</main>
                <SiteFooter />
            </div>
            <ContactModal open={contactOpen} onOpenChange={setContactOpen} subjects={contactSubjects} lotId={lotId} />
        </ContactContext.Provider>
    );
}
