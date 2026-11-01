import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { company, telHref } from '@/lib/site';
import { useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Field, inputClass } from './form-field';

interface ContactModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjects: string[];
    lotId?: number;
    defaultSubject?: string;
}

export default function ContactModal({ open, onOpenChange, subjects, lotId, defaultSubject }: ContactModalProps) {
    const [sent, setSent] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        lot_id: lotId ?? null,
        name: '',
        phone: '',
        email: '',
        subject: defaultSubject ?? subjects[0] ?? '',
        message: '',
        website: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('contact-enquiries.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('name', 'phone', 'email', 'message');
                setSent(true);
            },
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setSent(false);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="text-ink bg-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Speak to an auctioneer</DialogTitle>
                    <DialogDescription>
                        Call us on{' '}
                        <a className="text-brass-dark font-medium underline" href={telHref(company.phones[0])}>
                            {company.phones[0]}
                        </a>{' '}
                        or send a message and we'll get back to you.
                    </DialogDescription>
                </DialogHeader>

                {sent ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <CheckCircle2 className="size-12 text-emerald-600" />
                        <p className="font-display text-xl">Message received</p>
                        <p className="text-sm text-slate-600">An auctioneer will be in touch shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={submit} className="grid gap-4">
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
                        <Field label="Full name" error={errors.name}>
                            <input className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Email" error={errors.email}>
                                <input
                                    type="email"
                                    className={inputClass}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Phone (optional)" error={errors.phone}>
                                <input type="tel" className={inputClass} value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            </Field>
                        </div>
                        <Field label="What can we help with?" error={errors.subject}>
                            <select className={inputClass} value={data.subject} onChange={(e) => setData('subject', e.target.value)}>
                                {subjects.map((subject) => (
                                    <option key={subject}>{subject}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Message" error={errors.message}>
                            <textarea
                                rows={4}
                                className={inputClass}
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                required
                            />
                        </Field>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-ink hover:bg-ink-soft rounded-full px-6 py-3 font-medium text-white transition disabled:opacity-60"
                        >
                            {processing ? 'Sending…' : 'Send message'}
                        </button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
