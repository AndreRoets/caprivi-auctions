import { type Lot } from '@/types';
import { Building2 } from 'lucide-react';

export default function LotImage({ lot, className }: { lot: Lot; className?: string }) {
    if (lot.image_url) {
        return <img src={lot.image_url} alt={lot.title} className={`w-full object-cover ${className ?? ''}`} loading="lazy" />;
    }

    return (
        <div
            className={`from-ink to-ink-soft text-brass/70 flex w-full items-center justify-center bg-gradient-to-br ${className ?? ''}`}
            aria-label={`${lot.property_type} image coming soon`}
        >
            <Building2 className="size-14" />
        </div>
    );
}
