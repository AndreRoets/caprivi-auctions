import { formatRand } from '@/lib/site';
import { useState } from 'react';
import { Field, inputClass } from './form-field';

const VAT_RATE = 0.15;

export default function CommissionCalculator() {
    const [price, setPrice] = useState(1_000_000);
    const [sellerRate, setSellerRate] = useState(5);
    const [buyerRate, setBuyerRate] = useState(6);

    const sellerCommission = price * (sellerRate / 100);
    const sellerVat = sellerCommission * VAT_RATE;
    const netProceeds = price - sellerCommission - sellerVat;

    const buyerCommission = price * (buyerRate / 100);
    const buyerVat = buyerCommission * VAT_RATE;
    const buyerTotal = price + buyerCommission + buyerVat;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="border-sand-dark grid gap-4 rounded-2xl border bg-white p-6 shadow-sm">
                <Field label="Hammer price (R)">
                    <input
                        type="number"
                        min={0}
                        step={10000}
                        className={inputClass}
                        value={price}
                        onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                    />
                </Field>
                <Field label={`Seller commission: ${sellerRate}%`}>
                    <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={sellerRate}
                        onChange={(e) => setSellerRate(Number(e.target.value))}
                        className="accent-brass"
                    />
                </Field>
                <Field label={`Buyer's commission: ${buyerRate}%`}>
                    <input
                        type="range"
                        min={0}
                        max={12}
                        step={0.5}
                        value={buyerRate}
                        onChange={(e) => setBuyerRate(Number(e.target.value))}
                        className="accent-brass"
                    />
                </Field>
                <p className="text-xs text-slate-500">Illustration only. Your mandate sets the actual rates. VAT is calculated at 15%.</p>
            </div>

            <Breakdown
                title="What the seller receives"
                rows={[
                    ['Hammer price', price],
                    [`Seller commission (${sellerRate}%)`, -sellerCommission],
                    ['VAT on commission', -sellerVat],
                ]}
                totalLabel="Net proceeds before bond and costs"
                total={netProceeds}
            />

            <Breakdown
                title="What the buyer pays"
                rows={[
                    ['Hammer price', price],
                    [`Buyer's commission (${buyerRate}%)`, buyerCommission],
                    ['VAT on commission', buyerVat],
                ]}
                totalLabel="Total before transfer costs"
                total={buyerTotal}
            />
        </div>
    );
}

function Breakdown({ title, rows, totalLabel, total }: { title: string; rows: [string, number][]; totalLabel: string; total: number }) {
    return (
        <div className="bg-ink flex flex-col rounded-2xl p-6 text-white">
            <h3 className="font-display text-xl">{title}</h3>
            <dl className="mt-4 space-y-2 text-sm">
                {rows.map(([label, amount]) => (
                    <div key={label} className="flex justify-between gap-4">
                        <dt className="text-white/70">{label}</dt>
                        <dd className="tabular-nums">
                            {amount < 0 ? '− ' : ''}
                            {formatRand(Math.abs(amount))}
                        </dd>
                    </div>
                ))}
            </dl>
            <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/15 pt-4">
                <span className="text-sm text-white/70">{totalLabel}</span>
                <span className="font-display text-brass text-2xl tabular-nums">{formatRand(total)}</span>
            </div>
        </div>
    );
}
