import AccountShell, { FormError, SubmitButton } from '@/components/auctions/account-shell';
import { Field, inputClass } from '@/components/site/form-field';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function BuyerSignup({ returnTo }: { returnTo: string }) {
    const [codeSent, setCodeSent] = useState(false);
    const form = useForm({
        email: '',
        code: '',
        name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        popia_consent: false as boolean,
        return: returnTo,
    });
    const { data, setData, processing } = form;
    const errors = form.errors as Record<string, string | undefined>;

    const sendCode: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/account/signup/send', { preserveScroll: true, preserveState: true, onSuccess: () => setCodeSent(true) });
    };

    const verify: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/account/signup/verify', { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <AccountShell
            title="Create a free account"
            intro={
                codeSent ? (
                    <>
                        We emailed a 6-digit code to <strong>{data.email}</strong>.
                    </>
                ) : (
                    'Your account works here and on the agency’s CoreX auction page.'
                )
            }
            footer={
                <>
                    Already have an account?{' '}
                    <Link href={`/account/login?return=${encodeURIComponent(returnTo)}`} className="text-brass-dark font-medium underline">
                        Log in
                    </Link>
                </>
            }
        >
            {!codeSent ? (
                <form onSubmit={sendCode} className="grid gap-5" noValidate>
                    <Field label="Email" error={errors.email}>
                        <input
                            type="email"
                            className={inputClass}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="email"
                            autoFocus
                        />
                    </Field>
                    <FormError message={errors.form} />
                    <SubmitButton processing={processing} busyLabel="Sending code…">
                        Email me a code
                    </SubmitButton>
                </form>
            ) : (
                <form onSubmit={verify} className="grid gap-5" noValidate>
                    <Field label="6-digit code" error={errors.code}>
                        <input
                            className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                            autoFocus
                        />
                    </Field>
                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    <Field label="Full name" error={errors.name}>
                        <input className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" />
                    </Field>
                    <Field label="Mobile number (optional)" error={errors.phone}>
                        <input
                            type="tel"
                            className={inputClass}
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                        />
                    </Field>
                    <Field label="Password" error={errors.password}>
                        <input
                            type="password"
                            className={inputClass}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                        />
                    </Field>
                    <Field label="Confirm password" error={errors.password_confirmation}>
                        <input
                            type="password"
                            className={inputClass}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                    </Field>
                    <div>
                        <label className="flex min-h-11 items-start gap-3 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                className="accent-ink mt-0.5 size-5"
                                checked={data.popia_consent}
                                onChange={(e) => setData('popia_consent', e.target.checked)}
                            />
                            I consent to the agency processing my personal information to manage my account and bids, in line with POPIA.
                        </label>
                        {errors.popia_consent && <p className="mt-1 ml-8 text-xs text-red-600">{errors.popia_consent}</p>}
                    </div>
                    <FormError message={errors.form} />
                    <SubmitButton processing={processing} busyLabel="Creating account…">
                        Create account
                    </SubmitButton>
                    <button
                        type="button"
                        className="text-brass-dark min-h-11 text-sm font-medium underline"
                        onClick={() => {
                            form.clearErrors();
                            setCodeSent(false);
                        }}
                    >
                        Use a different email or send a new code
                    </button>
                </form>
            )}
        </AccountShell>
    );
}
