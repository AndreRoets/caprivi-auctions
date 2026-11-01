import {
    firstStepWithError,
    formatRand,
    initialSellAnswers,
    isSellSectionComplete,
    SELL_SECTIONS,
    sellPayload,
    sellPreviewTitle,
    stripNumber,
    type SellAnswers,
} from '@/lib/corex';
import { type SharedData } from '@/types';
import { type Options, type SellerQuestionnaireOptions } from '@/types/corex';
import { useForm, usePage } from '@inertiajs/react';
import { Check, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormEventHandler, ReactNode, useState } from 'react';
import { Field, inputClass } from './form-field';

type SelectField =
    | 'seller_type'
    | 'preferred_contact'
    | 'property_type'
    | 'occupancy'
    | 'condition'
    | 'auction_format'
    | 'reserve'
    | 'timing'
    | 'viewing';

const optionSource: Record<SelectField, keyof SellerQuestionnaireOptions> = {
    seller_type: 'seller_types',
    preferred_contact: 'contact_methods',
    property_type: 'property_types',
    occupancy: 'occupancy',
    condition: 'conditions',
    auction_format: 'auction_formats',
    reserve: 'reserve',
    timing: 'timing',
    viewing: 'viewing',
};

/** Spec defaults, falling back to the first CoreX option when the agency uses other values. */
function initialAnswers(options: SellerQuestionnaireOptions): SellAnswers {
    const answers = { ...initialSellAnswers };

    for (const [field, source] of Object.entries(optionSource) as [SelectField, keyof SellerQuestionnaireOptions][]) {
        const choices = options[source] as Options | null;
        if (choices && !(answers[field] in choices)) {
            answers[field] = Object.keys(choices)[0] ?? answers[field];
        }
    }

    return answers;
}

function Choice({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            onClick={onChange}
            aria-pressed={checked}
            className={`min-h-11 rounded-full border px-4 py-2 text-sm transition ${
                checked ? 'border-ink bg-ink text-white' : 'hover:border-ink border-slate-300 bg-white text-slate-700'
            }`}
        >
            {children}
        </button>
    );
}

function ChoiceGroup({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2 text-sm" role="group" aria-label={label}>
            <span className="font-medium text-slate-700">{label}</span>
            <div className="flex flex-wrap gap-2">{children}</div>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

interface SellerQuestionnaireProps {
    options: SellerQuestionnaireOptions;
    agencyName: string;
}

export default function SellerQuestionnaire({ options, agencyName }: SellerQuestionnaireProps) {
    const { flash } = usePage<SharedData>().props;
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState<string | null>(null);
    const form = useForm<SellAnswers>(initialAnswers(options));
    const { data, setData, processing } = form;
    const errors = form.errors as Record<string, string | undefined>;

    const completed = SELL_SECTIONS.filter((_, index) => isSellSectionComplete(index, data)).length;
    const errorFor = (field: string) => errors[field] ?? Object.entries(errors).find(([key]) => key.startsWith(`${field}.`))?.[1];

    const toggleInList = (field: 'features' | 'documents', value: string) => {
        const list = data[field];
        setData(field, list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (step < SELL_SECTIONS.length - 1) {
            setStep(step + 1);

            return;
        }

        form.transform((answers) => sellPayload(answers) as unknown as SellAnswers);
        form.post('/seller-questionnaire', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                form.reset();
                setStep(0);
                setSubmitted((page.props as unknown as SharedData).flash.sell_response ?? flash.sell_response ?? 'shortly');
            },
            onError: (validationErrors) => {
                const firstInvalid = firstStepWithError(Object.keys(validationErrors));
                if (firstInvalid >= 0) {
                    setStep(firstInvalid);
                }
            },
        });
    };

    if (submitted !== null) {
        return (
            <div className="border-sand-dark rounded-2xl border bg-white p-10 text-center shadow-sm" role="status">
                <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
                <h3 className="font-display mt-4 text-2xl">Questionnaire received</h3>
                <p className="mx-auto mt-2 max-w-md text-slate-600">Thank you. An auctioneer will contact you {submitted}.</p>
                <button type="button" className="text-brass-dark mt-6 min-h-11 text-sm font-medium underline" onClick={() => setSubmitted(null)}>
                    Submit another property
                </button>
            </div>
        );
    }

    const propertyLabel = options.property_types[data.property_type] ?? data.property_type ?? 'property';
    const priceExpectation = stripNumber(data.price_expectation);
    const pills = (field: SelectField) =>
        Object.entries(options[optionSource[field]] ?? {}).map(([value, label]) => (
            <Choice key={value} checked={data[field] === value} onChange={() => setData(field, value)}>
                {label}
            </Choice>
        ));
    const selectOptions = (field: SelectField) =>
        Object.entries(options[optionSource[field]] ?? {}).map(([value, label]) => (
            <option key={value} value={value}>
                {label}
            </option>
        ));
    const textInput = (field: keyof SellAnswers, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
        <input className={inputClass} value={data[field] as string} onChange={(e) => setData(field, e.target.value as never)} {...props} />
    );

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <form onSubmit={submit} className="border-sand-dark relative rounded-2xl border bg-white p-6 shadow-sm sm:p-8" noValidate>
                <input
                    type="text"
                    name="website"
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                    className="absolute -left-[10000px] size-px overflow-hidden opacity-0"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                />

                <div className="mb-6">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-ink font-medium">
                            Step {step + 1}: {SELL_SECTIONS[step]}
                        </span>
                        <span className="text-slate-500">
                            {completed} of {SELL_SECTIONS.length} sections complete
                        </span>
                    </div>
                    <div
                        className="bg-sand-dark h-1.5 overflow-hidden rounded-full"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={SELL_SECTIONS.length}
                        aria-valuenow={completed}
                        aria-label="Sections complete"
                    >
                        <div className="bg-brass h-full transition-all" style={{ width: `${(completed / SELL_SECTIONS.length) * 100}%` }} />
                    </div>
                    <ol className="mt-4 flex flex-wrap gap-2">
                        {SELL_SECTIONS.map((title, index) => (
                            <li key={title}>
                                <button
                                    type="button"
                                    onClick={() => setStep(index)}
                                    aria-current={index === step ? 'step' : undefined}
                                    className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${
                                        index === step ? 'bg-ink text-white' : 'bg-sand hover:bg-sand-dark text-slate-600'
                                    }`}
                                >
                                    {isSellSectionComplete(index, data) ? (
                                        <Check className="size-3" aria-label="Complete" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
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
                                    {selectOptions('seller_type')}
                                </select>
                            </Field>
                            {data.seller_type === 'married_in_community' && (
                                <Field label="Spouse's full name" error={errors.spouse_name} hint="Both spouses must sign the auction mandate.">
                                    {textInput('spouse_name', { maxLength: 120 })}
                                </Field>
                            )}
                            {data.seller_type === 'deceased_estate' && (
                                <Field label="Executor's name" error={errors.executor_name}>
                                    {textInput('executor_name', { maxLength: 120 })}
                                </Field>
                            )}
                            <Field label="Full name" error={errors.name}>
                                {textInput('name', { maxLength: 120, autoComplete: 'name' })}
                            </Field>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Email" error={errors.email}>
                                    {textInput('email', { type: 'email', autoComplete: 'email' })}
                                </Field>
                                <Field label="Mobile number" error={errors.phone}>
                                    {textInput('phone', { type: 'tel', maxLength: 30, autoComplete: 'tel' })}
                                </Field>
                            </div>
                            <ChoiceGroup label="Best way to reach you" error={errors.preferred_contact}>
                                {pills('preferred_contact')}
                            </ChoiceGroup>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <Field label="Property type" error={errors.property_type}>
                                <select className={inputClass} value={data.property_type} onChange={(e) => setData('property_type', e.target.value)}>
                                    {selectOptions('property_type')}
                                </select>
                            </Field>
                            <Field label="Street address" error={errors.address}>
                                {textInput('address', { maxLength: 255, autoComplete: 'street-address' })}
                            </Field>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Suburb" error={errors.suburb}>
                                    {textInput('suburb', { maxLength: 120 })}
                                </Field>
                                <Field label="Zoning (if known)" error={errors.zoning}>
                                    {textInput('zoning', { maxLength: 60 })}
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                                <Field label="Erf size (m²)" error={errors.erf_size}>
                                    {textInput('erf_size', { inputMode: 'numeric' })}
                                </Field>
                                <Field label="Floor size (m²)" error={errors.floor_size}>
                                    {textInput('floor_size', { inputMode: 'numeric' })}
                                </Field>
                                <Field label="Bedrooms" error={errors.bedrooms}>
                                    {textInput('bedrooms', { inputMode: 'numeric' })}
                                </Field>
                                <Field label="Bathrooms" error={errors.bathrooms}>
                                    {textInput('bathrooms', { inputMode: 'numeric' })}
                                </Field>
                            </div>
                            <ChoiceGroup label="Notable features" error={errorFor('features')}>
                                {Object.entries(options.features ?? {}).map(([value, label]) => (
                                    <Choice key={value} checked={data.features.includes(value)} onChange={() => toggleInList('features', value)}>
                                        {label}
                                    </Choice>
                                ))}
                            </ChoiceGroup>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <ChoiceGroup label="Who lives in the property?" error={errors.occupancy}>
                                {pills('occupancy')}
                            </ChoiceGroup>
                            {data.occupancy === 'tenant' && (
                                <Field label="Monthly rent (R)" error={errors.monthly_rent}>
                                    {textInput('monthly_rent', { inputMode: 'numeric' })}
                                </Field>
                            )}
                            <Field label="Overall condition" error={errors.condition}>
                                <select className={inputClass} value={data.condition} onChange={(e) => setData('condition', e.target.value)}>
                                    {selectOptions('condition')}
                                </select>
                            </Field>
                            <Field label="Known defects" error={errors.defects} hint="Disclosing defects up front protects you after the sale.">
                                <textarea
                                    rows={3}
                                    maxLength={2000}
                                    className={inputClass}
                                    value={data.defects}
                                    onChange={(e) => setData('defects', e.target.value)}
                                />
                            </Field>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <ChoiceGroup label="Is there a bond registered over the property?" error={errors.has_bond}>
                                <Choice checked={data.has_bond} onChange={() => setData('has_bond', true)}>
                                    Yes
                                </Choice>
                                <Choice checked={!data.has_bond} onChange={() => setData('has_bond', false)}>
                                    No
                                </Choice>
                            </ChoiceGroup>
                            {data.has_bond && (
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field label="Bank" error={errors.bond_bank}>
                                        {textInput('bond_bank')}
                                    </Field>
                                    <Field label="Approximate amount outstanding (R)" error={errors.bond_amount}>
                                        {textInput('bond_amount', { inputMode: 'numeric' })}
                                    </Field>
                                    <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={data.bond_arrears}
                                            onChange={(e) => setData('bond_arrears', e.target.checked)}
                                            className="accent-ink size-5"
                                        />
                                        The bond is currently in arrears
                                    </label>
                                </div>
                            )}
                            <div className="grid gap-5 sm:grid-cols-3">
                                <Field label="Monthly levies (R)" error={errors.levies}>
                                    {textInput('levies', { inputMode: 'numeric' })}
                                </Field>
                                <Field label="Municipal valuation (R)" error={errors.municipal_valuation}>
                                    {textInput('municipal_valuation', { inputMode: 'numeric' })}
                                </Field>
                                <Field label="Price you hope to achieve (R)" error={errors.price_expectation}>
                                    {textInput('price_expectation', { inputMode: 'numeric' })}
                                </Field>
                            </div>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <ChoiceGroup label="Preferred auction format" error={errors.auction_format}>
                                {pills('auction_format')}
                            </ChoiceGroup>
                            <ChoiceGroup label="Would you like a confidential reserve price?" error={errors.reserve}>
                                {pills('reserve')}
                            </ChoiceGroup>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="When would you like to sell?" error={errors.timing}>
                                    <select className={inputClass} value={data.timing} onChange={(e) => setData('timing', e.target.value)}>
                                        {selectOptions('timing')}
                                    </select>
                                </Field>
                                <Field label="Viewing access" error={errors.viewing}>
                                    <select className={inputClass} value={data.viewing} onChange={(e) => setData('viewing', e.target.value)}>
                                        {selectOptions('viewing')}
                                    </select>
                                </Field>
                            </div>
                            <Field label="Reason for selling (optional)" error={errors.sale_reason}>
                                {textInput('sale_reason', { maxLength: 500 })}
                            </Field>
                        </>
                    )}

                    {step === 5 && (
                        <>
                            <div className="grid gap-2 text-sm" role="group" aria-label="Which documents do you already have?">
                                <span className="font-medium text-slate-700">Which documents do you already have?</span>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {Object.entries(options.documents ?? {}).map(([value, label]) => (
                                        <label key={value} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                                            <input
                                                type="checkbox"
                                                checked={data.documents.includes(value)}
                                                onChange={() => toggleInList('documents', value)}
                                                className="accent-ink size-5"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                                {errorFor('documents') ? (
                                    <span className="text-xs text-red-600">{errorFor('documents')}</span>
                                ) : (
                                    <span className="text-xs text-slate-500">Don't worry if you're missing some – we can help you obtain them.</span>
                                )}
                            </div>
                            <Field label="How did you hear about us?" error={errors.referral_source}>
                                {textInput('referral_source')}
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
                                    ['consent_terms', 'I have read and accept the terms above.'],
                                    ['consent_authorised', 'I am the owner or am legally authorised to act on behalf of the owner.'],
                                    ['consent_processing', `I consent to ${agencyName} processing my information to prepare a proposal.`],
                                    ['marketing_opt_in', 'Send me occasional news about upcoming auctions'],
                                ] as const
                            ).map(([field, label]) => (
                                <div key={field}>
                                    <label className="flex min-h-11 items-start gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={data[field]}
                                            onChange={(e) => setData(field, e.target.checked)}
                                            className="accent-ink mt-0.5 size-5"
                                        />
                                        {label}
                                    </label>
                                    {errors[field] && <p className="mt-1 ml-8 text-xs text-red-600">{errors[field]}</p>}
                                </div>
                            ))}
                            {errors.website && <p className="text-xs text-red-600">{errors.website}</p>}
                        </>
                    )}
                </div>

                {errors.form && (
                    <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                        {errors.form}
                    </p>
                )}

                <div className="border-sand-dark mt-8 flex items-center justify-between border-t pt-6">
                    <button
                        type="button"
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        className="flex min-h-11 items-center gap-1 text-sm font-medium text-slate-600 disabled:invisible"
                    >
                        <ChevronLeft className="size-4" /> Back
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-ink hover:bg-ink-soft flex min-h-11 items-center gap-1 rounded-full px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {step < SELL_SECTIONS.length - 1 ? (
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

            <aside className="bg-ink h-fit rounded-2xl p-6 text-white shadow-lg lg:sticky lg:top-24" aria-label="Catalogue preview">
                <p className="text-brass text-xs font-semibold tracking-[0.2em] uppercase">Catalogue preview</p>
                <h3 className="font-display mt-3 text-2xl leading-snug first-letter:uppercase">{sellPreviewTitle(data, propertyLabel)}</h3>
                <p className="mt-1 text-sm text-white/60">{data.address || 'Your address will appear here'}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-white/50">Erf size</dt>
                        <dd>{stripNumber(data.erf_size) !== null ? `${stripNumber(data.erf_size)} m²` : '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-white/50">Floor size</dt>
                        <dd>{stripNumber(data.floor_size) !== null ? `${stripNumber(data.floor_size)} m²` : '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-white/50">Format</dt>
                        <dd>{options.auction_formats[data.auction_format] ?? '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-white/50">Reserve</dt>
                        <dd>{data.reserve === 'none' ? 'None' : 'Confidential'}</dd>
                    </div>
                </dl>
                {data.features.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                        {data.features.map((feature) => (
                            <li key={feature} className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                                {options.features[feature] ?? feature}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="text-xs text-white/50">Your price expectation</p>
                    <p className="font-display text-brass text-2xl">{priceExpectation !== null ? formatRand(priceExpectation) : '—'}</p>
                </div>
            </aside>
        </div>
    );
}
