import { formatRand } from '@/lib/site';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Check, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormEventHandler, ReactNode, useState } from 'react';
import { Field, inputClass } from './form-field';

const propertyTypes = ['House', 'Townhouse', 'Apartment', 'Vacant land', 'Farm or smallholding', 'Commercial', 'Industrial'];
const featureOptions = ['Pool', 'Borehole', 'Solar power', 'Garden flat', 'Electric fence', 'Fibre ready', 'Staff quarters', 'Double garage'];
const documentOptions = [
    'Title deed copy',
    'Latest rates account',
    'Approved building plans',
    'Levy statement',
    'Lease agreement',
    'Bond statement',
    'ID copies',
];

const sections = ['About you', 'The property', 'Occupancy', 'Bond & finances', 'Auction options', 'Documents', 'Terms & consent'];

type Answers = {
    seller_type: string;
    spouse_name: string;
    executor_name: string;
    name: string;
    email: string;
    phone: string;
    preferred_contact: string;
    property_type: string;
    address: string;
    suburb: string;
    erf_size: string;
    floor_size: string;
    zoning: string;
    bedrooms: string;
    bathrooms: string;
    features: string[];
    occupancy: string;
    monthly_rent: string;
    condition: string;
    known_defects: string;
    has_bond: boolean;
    bond_bank: string;
    bond_outstanding: string;
    in_arrears: boolean;
    monthly_levies: string;
    municipal_value: string;
    price_expectation: string;
    auction_platform: string;
    wants_reserve: boolean;
    timing: string;
    reason_for_selling: string;
    viewing_access: string;
    documents: string[];
    referral_source: string;
    accepts_terms: boolean;
    confirms_authority: boolean;
    consents_to_processing: boolean;
    marketing_opt_in: boolean;
    website: string;
};

const initialAnswers: Answers = {
    seller_type: 'individual',
    spouse_name: '',
    executor_name: '',
    name: '',
    email: '',
    phone: '',
    preferred_contact: 'phone',
    property_type: 'House',
    address: '',
    suburb: '',
    erf_size: '',
    floor_size: '',
    zoning: '',
    bedrooms: '',
    bathrooms: '',
    features: [],
    occupancy: 'owner',
    monthly_rent: '',
    condition: 'good',
    known_defects: '',
    has_bond: false,
    bond_bank: '',
    bond_outstanding: '',
    in_arrears: false,
    monthly_levies: '',
    municipal_value: '',
    price_expectation: '',
    auction_platform: 'online',
    wants_reserve: true,
    timing: '1_3_months',
    reason_for_selling: '',
    viewing_access: 'by_appointment',
    documents: [],
    referral_source: '',
    accepts_terms: false,
    confirms_authority: false,
    consents_to_processing: false,
    marketing_opt_in: false,
    website: '',
};

/** Which fields belong to each step, used to jump to the first step with a validation error. */
const sectionFields: (keyof Answers)[][] = [
    ['seller_type', 'spouse_name', 'executor_name', 'name', 'email', 'phone', 'preferred_contact'],
    ['property_type', 'address', 'suburb', 'erf_size', 'floor_size', 'zoning', 'bedrooms', 'bathrooms', 'features'],
    ['occupancy', 'monthly_rent', 'condition', 'known_defects'],
    ['has_bond', 'bond_bank', 'bond_outstanding', 'in_arrears', 'monthly_levies', 'municipal_value', 'price_expectation'],
    ['auction_platform', 'wants_reserve', 'timing', 'reason_for_selling', 'viewing_access'],
    ['documents', 'referral_source'],
    ['accepts_terms', 'confirms_authority', 'consents_to_processing', 'marketing_opt_in'],
];

function isSectionComplete(index: number, data: Answers): boolean {
    switch (index) {
        case 0:
            return Boolean(data.name && data.email && data.phone);
        case 1:
            return Boolean(data.address && data.suburb);
        case 2:
            return Boolean(data.occupancy && data.condition && (data.occupancy !== 'tenant' || data.monthly_rent));
        case 3:
            return !data.has_bond || Boolean(data.bond_bank);
        case 4:
            return Boolean(data.auction_platform && data.timing);
        case 5:
            return data.documents.length > 0 || Boolean(data.referral_source);
        case 6:
            return data.accepts_terms && data.confirms_authority && data.consents_to_processing;
        default:
            return false;
    }
}

function toNumberOrNull(value: string): number | null {
    const digits = value.replace(/[^\d]/g, '');

    return digits === '' ? null : Number(digits);
}

function Choice({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onChange}
            aria-pressed={checked}
            className={`rounded-full border px-4 py-2 text-sm transition ${
                checked ? 'border-ink bg-ink text-white' : 'hover:border-ink border-slate-300 bg-white text-slate-700'
            }`}
        >
            {children}
        </button>
    );
}

export default function SellerQuestionnaire() {
    const { flash } = usePage<SharedData>().props;
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const form = useForm<Answers>(initialAnswers);
    const { data, setData, errors, processing } = form;

    const completed = sections.filter((_, index) => isSectionComplete(index, data)).length;

    const toggleInList = (field: 'features' | 'documents', value: string) => {
        const list = data[field];
        setData(field, list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (step < sections.length - 1) {
            setStep(step + 1);

            return;
        }

        form.transform((answers) => ({
            ...answers,
            erf_size: toNumberOrNull(answers.erf_size),
            floor_size: toNumberOrNull(answers.floor_size),
            bedrooms: toNumberOrNull(answers.bedrooms),
            bathrooms: toNumberOrNull(answers.bathrooms),
            monthly_rent: toNumberOrNull(answers.monthly_rent),
            bond_outstanding: toNumberOrNull(answers.bond_outstanding),
            monthly_levies: toNumberOrNull(answers.monthly_levies),
            municipal_value: toNumberOrNull(answers.municipal_value),
            price_expectation: toNumberOrNull(answers.price_expectation),
        }));

        form.post(route('seller-submissions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setStep(0);
                setSubmitted(true);
            },
            onError: (validationErrors) => {
                const firstInvalid = sectionFields.findIndex((fields) => fields.some((field) => field in validationErrors));
                if (firstInvalid >= 0) {
                    setStep(firstInvalid);
                }
            },
        });
    };

    if (submitted) {
        return (
            <div className="border-sand-dark rounded-2xl border bg-white p-10 text-center shadow-sm">
                <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
                <h3 className="font-display mt-4 text-2xl">Questionnaire received</h3>
                <p className="mx-auto mt-2 max-w-md text-slate-600">
                    {flash.success ?? 'Thank you. An auctioneer will contact you within one business day.'}
                </p>
                <button type="button" className="text-brass-dark mt-6 text-sm font-medium underline" onClick={() => setSubmitted(false)}>
                    Submit another property
                </button>
            </div>
        );
    }

    const priceExpectation = toNumberOrNull(data.price_expectation);

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <form onSubmit={submit} className="border-sand-dark rounded-2xl border bg-white p-6 shadow-sm sm:p-8" noValidate>
                <input
                    type="text"
                    name="website"
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                />

                <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-ink font-medium">
                            Step {step + 1}: {sections[step]}
                        </span>
                        <span className="text-slate-500">
                            {completed} of {sections.length} sections complete
                        </span>
                    </div>
                    <div className="bg-sand-dark h-1.5 overflow-hidden rounded-full">
                        <div className="bg-brass h-full transition-all" style={{ width: `${(completed / sections.length) * 100}%` }} />
                    </div>
                    <ol className="mt-4 flex flex-wrap gap-2">
                        {sections.map((title, index) => (
                            <li key={title}>
                                <button
                                    type="button"
                                    onClick={() => setStep(index)}
                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                        index === step ? 'bg-ink text-white' : 'bg-sand hover:bg-sand-dark text-slate-600'
                                    }`}
                                >
                                    {isSectionComplete(index, data) ? <Check className="size-3" /> : <span>{index + 1}</span>}
                                    {title}
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="grid gap-5">
                    {step === 0 && (
                        <>
                            <Field label="I am selling as" error={errors.seller_type}>
                                <select className={inputClass} value={data.seller_type} onChange={(e) => setData('seller_type', e.target.value)}>
                                    <option value="individual">An individual owner</option>
                                    <option value="married_in_community">A spouse married in community of property</option>
                                    <option value="company_or_trust">A company, close corporation or trust</option>
                                    <option value="deceased_estate">The executor of a deceased estate</option>
                                </select>
                            </Field>
                            {data.seller_type === 'married_in_community' && (
                                <Field label="Spouse's full name" error={errors.spouse_name} hint="Both spouses must sign the auction mandate.">
                                    <input className={inputClass} value={data.spouse_name} onChange={(e) => setData('spouse_name', e.target.value)} />
                                </Field>
                            )}
                            {data.seller_type === 'deceased_estate' && (
                                <Field label="Executor's name" error={errors.executor_name}>
                                    <input
                                        className={inputClass}
                                        value={data.executor_name}
                                        onChange={(e) => setData('executor_name', e.target.value)}
                                    />
                                </Field>
                            )}
                            <Field label="Full name" error={errors.name}>
                                <input className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </Field>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Email" error={errors.email}>
                                    <input
                                        type="email"
                                        className={inputClass}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </Field>
                                <Field label="Mobile number" error={errors.phone}>
                                    <input type="tel" className={inputClass} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                </Field>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span className="font-medium text-slate-700">Best way to reach you</span>
                                <div className="flex flex-wrap gap-2">
                                    {(['phone', 'whatsapp', 'email'] as const).map((method) => (
                                        <Choice
                                            key={method}
                                            checked={data.preferred_contact === method}
                                            onChange={() => setData('preferred_contact', method)}
                                        >
                                            {method === 'whatsapp' ? 'WhatsApp' : method[0].toUpperCase() + method.slice(1)}
                                        </Choice>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <Field label="Property type" error={errors.property_type}>
                                <select className={inputClass} value={data.property_type} onChange={(e) => setData('property_type', e.target.value)}>
                                    {propertyTypes.map((type) => (
                                        <option key={type}>{type}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Street address" error={errors.address}>
                                <input className={inputClass} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                            </Field>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Suburb" error={errors.suburb}>
                                    <input className={inputClass} value={data.suburb} onChange={(e) => setData('suburb', e.target.value)} />
                                </Field>
                                <Field label="Zoning (if known)" error={errors.zoning}>
                                    <input className={inputClass} value={data.zoning} onChange={(e) => setData('zoning', e.target.value)} />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                                <Field label="Erf size (m²)" error={errors.erf_size}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.erf_size}
                                        onChange={(e) => setData('erf_size', e.target.value)}
                                    />
                                </Field>
                                <Field label="Floor size (m²)" error={errors.floor_size}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.floor_size}
                                        onChange={(e) => setData('floor_size', e.target.value)}
                                    />
                                </Field>
                                <Field label="Bedrooms" error={errors.bedrooms}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.bedrooms}
                                        onChange={(e) => setData('bedrooms', e.target.value)}
                                    />
                                </Field>
                                <Field label="Bathrooms" error={errors.bathrooms}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.bathrooms}
                                        onChange={(e) => setData('bathrooms', e.target.value)}
                                    />
                                </Field>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span className="font-medium text-slate-700">Notable features</span>
                                <div className="flex flex-wrap gap-2">
                                    {featureOptions.map((feature) => (
                                        <Choice
                                            key={feature}
                                            checked={data.features.includes(feature)}
                                            onChange={() => toggleInList('features', feature)}
                                        >
                                            {feature}
                                        </Choice>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="grid gap-2 text-sm">
                                <span className="font-medium text-slate-700">Who lives in the property?</span>
                                <div className="flex flex-wrap gap-2">
                                    {(
                                        [
                                            ['owner', 'Owner occupied'],
                                            ['tenant', 'Tenanted'],
                                            ['vacant', 'Vacant'],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <Choice key={value} checked={data.occupancy === value} onChange={() => setData('occupancy', value)}>
                                            {label}
                                        </Choice>
                                    ))}
                                </div>
                            </div>
                            {data.occupancy === 'tenant' && (
                                <Field label="Monthly rent (R)" error={errors.monthly_rent}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.monthly_rent}
                                        onChange={(e) => setData('monthly_rent', e.target.value)}
                                    />
                                </Field>
                            )}
                            <Field label="Overall condition" error={errors.condition}>
                                <select className={inputClass} value={data.condition} onChange={(e) => setData('condition', e.target.value)}>
                                    <option value="excellent">Excellent – move-in ready</option>
                                    <option value="good">Good – minor wear</option>
                                    <option value="fair">Fair – some repairs needed</option>
                                    <option value="needs_work">Needs significant work</option>
                                </select>
                            </Field>
                            <Field label="Known defects" error={errors.known_defects} hint="Disclosing defects up front protects you after the sale.">
                                <textarea
                                    rows={3}
                                    className={inputClass}
                                    value={data.known_defects}
                                    onChange={(e) => setData('known_defects', e.target.value)}
                                />
                            </Field>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="grid gap-2 text-sm">
                                <span className="font-medium text-slate-700">Is there a bond registered over the property?</span>
                                <div className="flex gap-2">
                                    <Choice checked={data.has_bond} onChange={() => setData('has_bond', true)}>
                                        Yes
                                    </Choice>
                                    <Choice checked={!data.has_bond} onChange={() => setData('has_bond', false)}>
                                        No
                                    </Choice>
                                </div>
                            </div>
                            {data.has_bond && (
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field label="Bank" error={errors.bond_bank}>
                                        <input className={inputClass} value={data.bond_bank} onChange={(e) => setData('bond_bank', e.target.value)} />
                                    </Field>
                                    <Field label="Approximate amount outstanding (R)" error={errors.bond_outstanding}>
                                        <input
                                            inputMode="numeric"
                                            className={inputClass}
                                            value={data.bond_outstanding}
                                            onChange={(e) => setData('bond_outstanding', e.target.value)}
                                        />
                                    </Field>
                                    <label className="flex items-center gap-2 text-sm sm:col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={data.in_arrears}
                                            onChange={(e) => setData('in_arrears', e.target.checked)}
                                            className="accent-ink size-4"
                                        />
                                        The bond is currently in arrears
                                    </label>
                                </div>
                            )}
                            <div className="grid gap-5 sm:grid-cols-3">
                                <Field label="Monthly levies (R)" error={errors.monthly_levies}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.monthly_levies}
                                        onChange={(e) => setData('monthly_levies', e.target.value)}
                                    />
                                </Field>
                                <Field label="Municipal valuation (R)" error={errors.municipal_value}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.municipal_value}
                                        onChange={(e) => setData('municipal_value', e.target.value)}
                                    />
                                </Field>
                                <Field label="Price you hope to achieve (R)" error={errors.price_expectation}>
                                    <input
                                        inputMode="numeric"
                                        className={inputClass}
                                        value={data.price_expectation}
                                        onChange={(e) => setData('price_expectation', e.target.value)}
                                    />
                                </Field>
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <div className="grid gap-2 text-sm">
                                <span className="font-medium text-slate-700">Preferred auction format</span>
                                <div className="flex flex-wrap gap-2">
                                    {(
                                        [
                                            ['online', 'Online'],
                                            ['live', 'Live on site'],
                                            ['hybrid', 'Hybrid'],
                                            ['tender', 'Sealed tender'],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <Choice
                                            key={value}
                                            checked={data.auction_platform === value}
                                            onChange={() => setData('auction_platform', value)}
                                        >
                                            {label}
                                        </Choice>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span className="font-medium text-slate-700">Would you like a confidential reserve price?</span>
                                <div className="flex gap-2">
                                    <Choice checked={data.wants_reserve} onChange={() => setData('wants_reserve', true)}>
                                        Yes, protect my minimum
                                    </Choice>
                                    <Choice checked={!data.wants_reserve} onChange={() => setData('wants_reserve', false)}>
                                        No reserve
                                    </Choice>
                                </div>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="When would you like to sell?" error={errors.timing}>
                                    <select className={inputClass} value={data.timing} onChange={(e) => setData('timing', e.target.value)}>
                                        <option value="asap">As soon as possible</option>
                                        <option value="1_3_months">Within 1–3 months</option>
                                        <option value="3_6_months">Within 3–6 months</option>
                                        <option value="exploring">Just exploring my options</option>
                                    </select>
                                </Field>
                                <Field label="Viewing access" error={errors.viewing_access}>
                                    <select
                                        className={inputClass}
                                        value={data.viewing_access}
                                        onChange={(e) => setData('viewing_access', e.target.value)}
                                    >
                                        <option value="anytime">Available most days</option>
                                        <option value="by_appointment">By appointment</option>
                                        <option value="restricted">Restricted (tenant or security)</option>
                                    </select>
                                </Field>
                            </div>
                            <Field label="Reason for selling (optional)" error={errors.reason_for_selling}>
                                <input
                                    className={inputClass}
                                    value={data.reason_for_selling}
                                    onChange={(e) => setData('reason_for_selling', e.target.value)}
                                />
                            </Field>
                        </>
                    )}

                    {step === 5 && (
                        <>
                            <div className="grid gap-2 text-sm">
                                <span className="font-medium text-slate-700">Which documents do you already have?</span>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {documentOptions.map((doc) => (
                                        <label key={doc} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                                            <input
                                                type="checkbox"
                                                checked={data.documents.includes(doc)}
                                                onChange={() => toggleInList('documents', doc)}
                                                className="accent-ink size-4"
                                            />
                                            {doc}
                                        </label>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-500">Don't worry if you're missing some – we can help you obtain them.</span>
                            </div>
                            <Field label="How did you hear about us?" error={errors.referral_source}>
                                <input
                                    className={inputClass}
                                    value={data.referral_source}
                                    onChange={(e) => setData('referral_source', e.target.value)}
                                />
                            </Field>
                        </>
                    )}

                    {step === 6 && (
                        <>
                            <ol className="bg-sand list-decimal space-y-2 rounded-lg p-5 pl-9 text-sm text-slate-700">
                                <li>
                                    Submitting this questionnaire does not commit you to selling. A sale only proceeds once you sign an auction
                                    mandate.
                                </li>
                                <li>The valuation and marketing proposal we prepare for you are free of charge.</li>
                                <li>The information you provide is used to assess the property and will be verified before any listing goes live.</li>
                                <li>Your personal information is handled in line with the Protection of Personal Information Act (POPIA).</li>
                            </ol>
                            {(
                                [
                                    ['accepts_terms', 'I have read and accept the terms above.'],
                                    ['confirms_authority', 'I am the owner or am legally authorised to act on behalf of the owner.'],
                                    ['consents_to_processing', 'I consent to Caprivi Auctions processing my information to prepare a proposal.'],
                                    ['marketing_opt_in', 'Send me occasional news about upcoming auctions (optional).'],
                                ] as const
                            ).map(([field, label]) => (
                                <div key={field}>
                                    <label className="flex items-start gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={data[field]}
                                            onChange={(e) => setData(field, e.target.checked)}
                                            className="accent-ink mt-0.5 size-4"
                                        />
                                        {label}
                                    </label>
                                    {errors[field] && <p className="mt-1 ml-7 text-xs text-red-600">{errors[field]}</p>}
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className="border-sand-dark mt-8 flex items-center justify-between border-t pt-6">
                    <button
                        type="button"
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        className="flex items-center gap-1 text-sm font-medium text-slate-600 disabled:invisible"
                    >
                        <ChevronLeft className="size-4" /> Back
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-ink hover:bg-ink-soft flex items-center gap-1 rounded-full px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {step < sections.length - 1 ? (
                            <>
                                Continue <ChevronRight className="size-4" />
                            </>
                        ) : processing ? (
                            'Submitting…'
                        ) : (
                            'Submit questionnaire'
                        )}
                    </button>
                </div>
            </form>

            <aside className="bg-ink h-fit rounded-2xl p-6 text-white shadow-lg lg:sticky lg:top-24">
                <p className="text-brass text-xs font-semibold tracking-[0.2em] uppercase">Catalogue preview</p>
                <h3 className="font-display mt-3 text-2xl leading-snug">
                    {data.bedrooms ? `${data.bedrooms}-bedroom ` : ''}
                    {data.property_type.toLowerCase()}
                    {data.suburb ? ` in ${data.suburb}` : ''}
                </h3>
                <p className="mt-1 text-sm text-white/60">{data.address || 'Your address will appear here'}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-white/50">Erf size</dt>
                        <dd>{data.erf_size ? `${data.erf_size} m²` : '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-white/50">Floor size</dt>
                        <dd>{data.floor_size ? `${data.floor_size} m²` : '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-white/50">Format</dt>
                        <dd className="capitalize">{data.auction_platform}</dd>
                    </div>
                    <div>
                        <dt className="text-white/50">Reserve</dt>
                        <dd>{data.wants_reserve ? 'Confidential' : 'None'}</dd>
                    </div>
                </dl>
                {data.features.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                        {data.features.map((feature) => (
                            <li key={feature} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="text-xs text-white/50">Your price expectation</p>
                    <p className="font-display text-brass text-2xl">{priceExpectation ? formatRand(priceExpectation) : '—'}</p>
                </div>
            </aside>
        </div>
    );
}
