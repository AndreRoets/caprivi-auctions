import SiteLayout from '@/layouts/site-layout';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

/** Narrow centred card used by the buyer login, sign-up and password pages. */
export default function AccountShell({
    title,
    intro,
    children,
    footer,
}: {
    title: string;
    intro?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}) {
    return (
        <SiteLayout>
            <Head title={title} />
            <div className="mx-auto w-full max-w-md px-4 py-14 sm:px-6">
                <h1 className="font-display text-ink text-center text-4xl">{title}</h1>
                {intro && <p className="mt-3 text-center text-slate-600">{intro}</p>}
                <div className="border-sand-dark mt-8 rounded-2xl border bg-white p-6 shadow-sm sm:p-8">{children}</div>
                {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
            </div>
        </SiteLayout>
    );
}

export function FormError({ message }: { message?: string }) {
    return message ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {message}
        </p>
    ) : null;
}

export function SubmitButton({ processing, children, busyLabel }: { processing: boolean; children: ReactNode; busyLabel: string }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="bg-ink hover:bg-ink-soft min-h-12 w-full rounded-full px-6 font-semibold text-white disabled:opacity-60"
        >
            {processing ? busyLabel : children}
        </button>
    );
}
