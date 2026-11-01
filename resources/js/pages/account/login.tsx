import AccountShell, { FormError, SubmitButton } from '@/components/auctions/account-shell';
import { Field, inputClass } from '@/components/site/form-field';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function BuyerLogin({ returnTo }: { returnTo: string }) {
    const form = useForm({ email: '', password: '', return: returnTo });
    const { data, setData, processing } = form;
    const errors = form.errors as Record<string, string | undefined>;
    const query = `?return=${encodeURIComponent(returnTo)}`;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post('/account/login', { onFinish: () => form.reset('password') });
    };

    return (
        <AccountShell
            title="Log in"
            intro="Use the same email and password as on the agency's CoreX auction page."
            footer={
                <>
                    New here?{' '}
                    <Link href={`/account/signup${query}`} className="text-brass-dark font-medium underline">
                        Create a free account
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="grid gap-5" noValidate>
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
                <Field label="Password" error={errors.password}>
                    <input
                        type="password"
                        className={inputClass}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="current-password"
                    />
                </Field>
                <FormError message={errors.form} />
                <SubmitButton processing={processing} busyLabel="Logging in…">
                    Log in
                </SubmitButton>
                <Link href={`/account/forgot-password${query}`} className="text-brass-dark min-h-11 text-center text-sm font-medium underline">
                    Forgot your password?
                </Link>
            </form>
        </AccountShell>
    );
}
