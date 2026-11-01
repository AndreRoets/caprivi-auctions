import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: 'Am I committed to selling once I complete the questionnaire?',
        answer: 'No. The questionnaire simply gives us what we need to value the property and propose an auction plan. Nothing is binding until you sign an auction mandate.',
    },
    {
        question: 'What is a reserve price and do I need one?',
        answer: 'A reserve is the confidential minimum you are willing to accept. If bidding does not reach it, the property is not sold. Most sellers choose a reserve for peace of mind; we will advise you on a realistic figure.',
    },
    {
        question: 'How much commission will I pay?',
        answer: 'Seller commission is agreed in your mandate before the auction. In many auctions the buyer also pays a buyer’s commission, which can reduce your costs. Try the commission illustration above to see how the numbers work.',
    },
    {
        question: 'Can I sell a property that is bonded or in arrears?',
        answer: 'Yes. The bond is settled from the proceeds on transfer. If you are behind on payments, a fixed auction date can help you sell before matters escalate. Speak to us early so we can work with your bank.',
    },
    {
        question: 'What happens when the hammer falls?',
        answer: 'If the highest bid meets your reserve, the buyer signs the conditions of sale and pays a deposit. You then have a short confirmation period, after which conveyancers start the transfer.',
    },
    {
        question: 'What if my property does not sell?',
        answer: 'We will share the bidding activity with you, discuss any post-auction offers, and agree on the next steps, whether that is a negotiated sale, a revised reserve or a future auction.',
    },
];

export default function FaqList() {
    return (
        <div className="divide-sand-dark border-sand-dark divide-y rounded-2xl border bg-white">
            {faqs.map((faq) => (
                <details key={faq.question} className="group p-5 sm:px-6">
                    <summary className="text-ink flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                        {faq.question}
                        <ChevronDown className="text-brass-dark size-5 shrink-0 transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-slate-600">{faq.answer}</p>
                </details>
            ))}
        </div>
    );
}
