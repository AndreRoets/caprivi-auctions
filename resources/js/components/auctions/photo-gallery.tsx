import { photoThumb, photoUrl } from '@/lib/corex';
import { type Photo } from '@/types/corex';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { KeyboardEvent, useRef } from 'react';

interface PhotoGalleryProps {
    photos: Photo[];
    title: string;
    /** Index of the open photo, or null when closed. */
    index: number | null;
    onIndexChange: (index: number | null) => void;
}

/**
 * Full-screen gallery: arrows, keyboard, swipe and thumbnails. Radix traps focus,
 * closes on Esc or an outside click, and returns focus to the photo that opened it.
 */
export default function PhotoGallery({ photos, title, index, onIndexChange }: PhotoGalleryProps) {
    const touchStartX = useRef<number | null>(null);
    const count = photos.length;
    const open = index !== null && count > 0;
    const current = index ?? 0;

    const go = (delta: number) => onIndexChange((current + delta + count) % count);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            go(1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            go(-1);
        }
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && onIndexChange(null)}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90" />
                <DialogPrimitive.Content
                    className="fixed inset-0 z-50 flex flex-col text-white outline-none"
                    onKeyDown={onKeyDown}
                    onPointerDownOutside={() => onIndexChange(null)}
                    aria-describedby={undefined}
                >
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                        <DialogPrimitive.Title className="truncate text-sm font-medium">{title}</DialogPrimitive.Title>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-white/70 tabular-nums" aria-live="polite">
                                {current + 1} / {count}
                            </span>
                            <DialogPrimitive.Close
                                className="flex size-11 items-center justify-center rounded-full hover:bg-white/10"
                                aria-label="Close gallery"
                            >
                                <X />
                            </DialogPrimitive.Close>
                        </div>
                    </div>

                    <div
                        className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16"
                        onClick={(event) => event.target === event.currentTarget && onIndexChange(null)}
                        onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
                        onTouchEnd={(event) => {
                            if (touchStartX.current === null) {
                                return;
                            }
                            const delta = event.changedTouches[0].clientX - touchStartX.current;
                            touchStartX.current = null;
                            if (Math.abs(delta) > 50) {
                                go(delta < 0 ? 1 : -1);
                            }
                        }}
                    >
                        {open && (
                            <img
                                src={photoUrl(photos[current]) ?? ''}
                                alt={`${title} – photo ${current + 1} of ${count}`}
                                className="max-h-full max-w-full object-contain select-none"
                            />
                        )}
                        {count > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => go(-1)}
                                    className="absolute left-2 flex size-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 sm:left-4"
                                    aria-label="Previous photo"
                                >
                                    <ChevronLeft />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => go(1)}
                                    className="absolute right-2 flex size-12 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 sm:right-4"
                                    aria-label="Next photo"
                                >
                                    <ChevronRight />
                                </button>
                            </>
                        )}
                    </div>

                    {count > 1 && (
                        <ul className="flex gap-2 overflow-x-auto px-4 py-3" aria-label="Thumbnails">
                            {photos.map((photo, photoIndex) => (
                                <li key={photoIndex} className="shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => onIndexChange(photoIndex)}
                                        aria-label={`Show photo ${photoIndex + 1}`}
                                        aria-current={photoIndex === current ? 'true' : undefined}
                                        className={`block overflow-hidden rounded-md ring-2 ${photoIndex === current ? 'ring-brass' : 'opacity-60 ring-transparent hover:opacity-100'}`}
                                    >
                                        <img src={photoThumb(photo) ?? ''} alt="" className="h-14 w-20 object-cover" loading="lazy" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
