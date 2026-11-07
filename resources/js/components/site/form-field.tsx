import { ReactNode } from 'react';

export const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-ink shadow-xs outline-none transition focus:border-brass focus:ring-2 focus:ring-brass/30';

interface FieldProps {
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}

export function Field({ label, error, hint, children, className }: FieldProps) {
    return (
        <label className={`grid content-start gap-1.5 text-sm ${className ?? ''}`}>
            <span className="font-medium text-slate-700">{label}</span>
            {children}
            {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}
