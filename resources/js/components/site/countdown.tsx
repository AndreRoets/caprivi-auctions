import { useEffect, useState } from 'react';

interface CountdownProps {
    target: string | null;
    variant?: 'dark' | 'light';
}

function remaining(target: string | null) {
    const diff = target ? Math.max(0, new Date(target).getTime() - Date.now()) : 0;

    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isOver: diff === 0,
    };
}

export default function Countdown({ target, variant = 'dark' }: CountdownProps) {
    const [time, setTime] = useState(() => remaining(target));

    useEffect(() => {
        const timer = window.setInterval(() => setTime(remaining(target)), 1000);

        return () => window.clearInterval(timer);
    }, [target]);

    if (!target) {
        return null;
    }

    if (time.isOver) {
        return <p className="text-sm font-medium">Bidding has closed.</p>;
    }

    const cell = variant === 'dark' ? 'bg-white/10 text-white' : 'bg-sand text-ink';
    const label = variant === 'dark' ? 'text-white/60' : 'text-slate-500';

    return (
        <div className="grid grid-cols-4 gap-2" role="timer" aria-live="off">
            {(
                [
                    ['days', time.days],
                    ['hours', time.hours],
                    ['min', time.minutes],
                    ['sec', time.seconds],
                ] as const
            ).map(([unit, value]) => (
                <div key={unit} className={`rounded-lg px-2 py-3 text-center ${cell}`}>
                    <div className="font-display text-2xl tabular-nums sm:text-3xl">{String(value).padStart(2, '0')}</div>
                    <div className={`text-[11px] tracking-wider uppercase ${label}`}>{unit}</div>
                </div>
            ))}
        </div>
    );
}
