import AccountShell, { FormError, SubmitButton } from '@/components/auctions/account-shell';
import { Field, inputClass } from '@/components/site/form-field';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function BuyerForgotPassword({ returnTo }: { returnTo: string }) {
    const [codeSent, setCodeSent] = useState(false);
    const form = useForm({ email: '', code: '', password: '', password_confirmation: '', return: returnTo });
    const { data, setData, processing } = form;
    const errors = form.errors as Record<string, string | undefined>;

    const sendCode: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/account/forgot-password/send', { preserveScroll: true, preserveState: true, onSuccess: () => setCodeSent(true) });
    };

    const reset: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/account/forgot-password/reset', { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <AccountShell
            title="Reset your password"
            intro={
                codeSent ? (
                    <>
                        If <strong>{data.email}</strong> has an account, we have emailed it a 6-digit code.
                    </>
                ) : (
                    'We will email you a code to choose a new password.'
                )
            }
            footer={
                <Link href={`/account/login?return=${encodeURIComponent(returnTo)}`} className="text-brass-dark font-medium underline">
                    Back to log in
                </Link>
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
                <form onSubmit={reset} className="grid gap-5" noValidate>
                    <Field label="6-digit code" error={errors.code ?? errors.email}>
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
                    <Field label="New password" error={errors.password}>
                        <input
                            type="password"
                            className={inputClass}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="new-password"
                        />
                    </Field>
                    <Field label="Confirm new password" error={errors.password_confirmation}>
                        <input
                            type="password"
                            className={inputClass}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            autoComplete="new-password"
                        />
                    </Field>
                    <FormError message={errors.form} />
                    <SubmitButton processing={processing} busyLabel="Saving…">
                        Set new password and log in
                    </SubmitButton>
                    <button type="button" className="text-brass-dark min-h-11 text-sm font-medium underline" onClick={() => setCodeSent(false)}>
                        Send a new code
                    </button>
                </form>
            )}
        </AccountShell>
    );
}
