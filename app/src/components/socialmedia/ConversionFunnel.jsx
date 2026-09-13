import { formatNumber } from "@/lib/funnel";
import { campaign } from "@/lib/socialMedia";

const COLORS = [
  "var(--pw-navy-800)",
  "var(--sg-blue-700)",
  "var(--sg-blue-500)",
  "var(--pw-navy-400)",
  "var(--sg-gold-700)",
  "var(--sg-terracotta-500)",
  "var(--success)",
];

export default function ConversionFunnel() {
  const steps = campaign.funnel;
  // "Impressionen" übersteigt "Reichweite" (mehrfache Ausspielung pro Person) —
  // Balkenbreite deshalb relativ zum größten Wert, nicht zum ersten Schritt.
  const max = Math.max(...steps.map((s) => s.value));

  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((step, i) => {
        const widthPercent = Math.min(88, Math.max(14, (step.value / max) * 100));
        const prevValue = i > 0 ? steps[i - 1].value : null;
        const isDecrease = prevValue != null && step.value < prevValue;
        const changePercent = prevValue ? Math.round((1 - step.value / prevValue) * 1000) / 10 : null;
        return (
          <div className="flex items-center gap-3" key={step.key}>
            <div
              className="flex h-10 shrink-0 items-center justify-center rounded-lg px-4 text-xs font-medium whitespace-nowrap text-white shadow-sm"
              style={{ width: `${widthPercent}%`, background: COLORS[i % COLORS.length] }}
            >
              {step.label}
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{formatNumber(step.value)}</span>
            {isDecrease && <span className="text-xs whitespace-nowrap text-muted-foreground">(-{changePercent} %)</span>}
          </div>
        );
      })}
    </div>
  );
}
