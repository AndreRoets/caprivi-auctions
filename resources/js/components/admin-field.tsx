import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { ReactNode } from 'react';

interface AdminFieldProps {
    id: string;
    label: string;
    hint?: ReactNode;
    error?: string;
    children: ReactNode;
    className?: string;
}

export default function AdminField({ id, label, hint, error, children, className }: AdminFieldProps) {
    return (
        <div className={`grid content-start gap-2 ${className ?? ''}`}>
            <Label htmlFor={id}>{label}</Label>
            {children}
            {hint && !error && <p className="text-muted-foreground text-xs">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}

/** Splits a one-item-per-line textarea value into a clean list. */
export function linesToList(value: string): string[] {
    return value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line !== '');
}

/** Returns the first error reported for a list field or any of its items. */
export function listError(errors: Record<string, string | undefined>, field: string): string | undefined {
    return errors[field] ?? Object.entries(errors).find(([key]) => key.startsWith(`${field}.`))?.[1];
}
