import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { site } = usePage<SharedData>().props;

    return (
        <>
            <img src="/images/caprivi-logo.png" alt="" className="size-8 shrink-0" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{site.company_name}</span>
                <span className="text-muted-foreground truncate text-xs">Website admin</span>
            </div>
        </>
    );
}
