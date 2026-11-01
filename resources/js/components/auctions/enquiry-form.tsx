import { Field, inputClass } from '@/components/site/form-field';
import { type SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

/** Enquiry about an auction or a lot; forwarded to the agency in CoreX. */
export default function EnquiryForm({ action, heading }: { action: string; heading: string }) {
    const { buyer } = usePage<SharedData>().props;
    const [sent, setSent] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: buyer?.name ?? '',
        email: buyer?.email ?? '',
        phone: buyer?.phone ?? '',
        message: '',
        popia_consent: false as boolean,
    });
    const allErrors = errors as Record<string, string | undefined>;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(action, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset('message', 'popia_consent');
                setSent(true);
            },
        });
    };

    if (sent) {
        return (
            <div className="border-sand-dark rounded-2xl border bg-white p-6 text-center" role="status">
                <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
                <p className="font-display text-ink mt-3 text-xl">Enquiry sent</p>
                <p className="mt-1 text-sm text-slate-600">The auctioneer will be in touch.</p>
                <button type="button" className="text-brass-dark mt-4 min-h-11 text-sm font-medium underline" onClick={() => setSent(false)}>
                    Send another enquiry
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="border-sand-dark grid gap-4 rounded-2xl border bg-white p-6" noValidate>
            <h3 className="font-display text-ink text-xl">{heading}</h3>
            <Field label="Your name" error={errors.name}>
                <input className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" error={errors.email}>
                    <input
                        type="email"
                        className={inputClass}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                    />
                </Field>
                <Field label="Phone" error={errors.phone} hint="Email or phone – at least one.">
                    <input
                        type="tel"
                        className={inputClass}
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        autoComplete="tel"
                    />
                </Field>
            </div>
            <Field label="Message (optional)" error={errors.message}>
                <textarea rows={3} className={inputClass} value={data.message} onChange={(e) => setData('message', e.target.value)} />
            </Field>
            <div>
                <label className="flex min-h-11 items-start gap-3 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={data.popia_consent}
                        onChange={(e) => setData('popia_consent', e.target.checked)}
                        className="accent-ink mt-0.5 size-5"
                    />
                    I agree that the agency may use these details to respond to my enquiry (POPIA).
                </label>
                {errors.popia_consent && <p className="mt-1 ml-8 text-xs text-red-600">{errors.popia_consent}</p>}
            </div>
            {allErrors.form && <p className="text-sm text-red-600">{allErrors.form}</p>}
            <button
                type="submit"
                disabled={processing}
                className="bg-ink hover:bg-ink-soft min-h-11 rounded-full px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
                {processing ? 'Sending…' : 'Send enquiry'}
            </button>
        </form>
    );
}
