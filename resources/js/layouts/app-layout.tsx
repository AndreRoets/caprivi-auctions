import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

function FlashMessage() {
    const { flash } = usePage<SharedData>().props;

    if (!flash.success) {
        return null;
    }

    return (
        <div
            role="status"
            className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        >
            <CheckCircle2 className="size-4 shrink-0" />
            {flash.success}
        </div>
    );
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <FlashMessage />
        {children}
    </AppLayoutTemplate>
);
