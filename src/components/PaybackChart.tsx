import { shortMoney } from "@/lib/format";
import { HORIZON_MONTHS, cumulativeSeries, type PaybackResult } from "@/lib/payback";
import { SCENARIO_IDS, SCENARIO_LABEL, type ScenarioId } from "@/lib/scenarios";

type Props = {
  results: Record<ScenarioId, PaybackResult>;
  selected: ScenarioId;
  sym: string;
};

const W = 560, H = 230, L = 64, R = 14, T = 14, B = 30;
const DASH: Record<ScenarioId, string | undefined> = { conservative: "5 4", realistic: undefined, optimistic: "1.5 3.5" };

/**
 * Cumulative net position for the three scenarios. Colours come from
 * --series-* on the surrounding surface (dark display or paper sheet).
 */
export function PaybackChart({ results, selected, sym }: Props) {
  const series = SCENARIO_IDS.map((id) => ({ id, pts: cumulativeSeries(results[id]) }));
  const all = series.flatMap((s) => s.pts);
  let lo = Math.min(0, ...all);
  let hi = Math.max(0, ...all);
  if (hi === lo) hi = lo + 1;
  const pad = (hi - lo) * 0.08;
  lo -= pad;
  hi += pad;
  const x = (m: number) => L + (m / HORIZON_MONTHS) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

  const raw = (hi - lo) / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);

  // draw the selected scenario last so it sits on top
  const order = [...series].sort((a, b) => (a.id === selected ? 1 : 0) - (b.id === selected ? 1 : 0));
  const pathOf = (pts: number[]) => pts.map((v, m) => `${m ? "L" : "M"}${x(m).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const sel = results[selected];
  const desc = SCENARIO_IDS.map((id) => {
    const r = results[id];
    return `${SCENARIO_LABEL[id]}: starts at ${shortMoney(-r.upfront, sym)}, ends month 36 at ${shortMoney(r.net3Years, sym)}`;
  }).join(". ");

  return (
    <figure className="m-0 flex min-w-0 flex-col gap-2">
      <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs" style={{ color: "var(--chart-dim)" }}>
        {SCENARIO_IDS.map((id) => (
          <li key={id} className="flex items-center gap-1.5" style={id === selected ? { color: "var(--chart-ink)" } : undefined}>
            <svg width="22" height="8" aria-hidden="true">
              <line x1="1" x2="21" y1="4" y2="4" stroke={`var(--series-${id})`} strokeWidth={2.5} strokeDasharray={DASH[id]} strokeLinecap="round" />
            </svg>
            {SCENARIO_LABEL[id]}
          </li>
        ))}
      </ul>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Cumulative net position over 36 months. ${desc}.`}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--chart-dim)" className="num">
              {shortMoney(v, sym)}
            </text>
          </g>
        ))}
        {[0, 12, 24, 36].map((m) => (
          <text key={m} x={x(m)} y={H - 8} textAnchor={m === 0 ? "start" : m === 36 ? "end" : "middle"} fontSize={11} fill="var(--chart-dim)" className="num">
            {m === 0 ? "Start" : `Month ${m}`}
          </text>
        ))}
        <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="var(--chart-dim)" strokeWidth={1} strokeDasharray="3 3" />
        {order.map(({ id, pts }) => {
          const on = id === selected;
          return (
            <g key={id}>
              {on && (
                <path
                  d={`${pathOf(pts)} L${x(36).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`}
                  fill={`var(--series-${id})`}
                  fillOpacity={0.12}
                />
              )}
              <path
                d={pathOf(pts)}
                fill="none"
                stroke={`var(--series-${id})`}
                strokeWidth={on ? 2.75 : 1.75}
                strokeOpacity={on ? 1 : 0.85}
                strokeDasharray={DASH[id]}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={x(36)} cy={y(pts[36])} r={on ? 4 : 3} fill={`var(--series-${id})`} />
            </g>
          );
        })}
        {Number.isFinite(sel.paybackMonths) && sel.paybackMonths <= 36 && (() => {
          const px = x(sel.paybackMonths), py = y(0);
          const end = px > W - 120;
          return (
            <g>
              <circle cx={px} cy={py} r={5} fill={`var(--series-${selected})`} stroke="var(--chart-ink)" strokeWidth={1.5} />
              <text x={end ? px - 8 : px + 8} y={py - 12} textAnchor={end ? "end" : "start"} fontSize={12} fontWeight={600} fill="var(--chart-ink)" stroke="var(--chart-bg)" strokeWidth={4} paintOrder="stroke" strokeLinejoin="round">
                {SCENARIO_LABEL[selected]} paid back
              </text>
            </g>
          );
        })()}
      </svg>
    </figure>
  );
}
