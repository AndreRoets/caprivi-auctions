import { type CorexSite } from '@/types/corex';
import SellerQuestionnaire from './seller-questionnaire';

/** The "Sell at auction" section; only shown when the agency has the form switched on in CoreX. */
export default function SellerQuestionnaireSection({ corexSite, className }: { corexSite: CorexSite | null; className?: string }) {
    if (!corexSite?.features.seller_questionnaire || !corexSite.seller_questionnaire) {
        return null;
    }

    return (
        <section id="questionnaire" className={`scroll-mt-20 py-20 ${className ?? ''}`} aria-labelledby="questionnaire-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-10 max-w-2xl">
                    <p className="text-brass-dark text-xs font-semibold tracking-[0.2em] uppercase">Sell at auction</p>
                    <h2 id="questionnaire-heading" className="font-display text-ink mt-2 text-3xl sm:text-4xl">
                        Seller questionnaire
                    </h2>
                    <p className="mt-3 text-slate-600">
                        Seven short sections. Your answers build a live catalogue preview as you go, and you can move between sections at any time.
                    </p>
                    <p className="mt-2 text-sm text-slate-500">Takes about 8 minutes · No obligation to sell</p>
                </div>
                <SellerQuestionnaire options={corexSite.seller_questionnaire} agencyName={corexSite.agency.name} />
            </div>
        </section>
    );
}
