import { ClipboardCheck } from "lucide-react";
import { buildCostMetrics, formatCurrency, formatNumber, getRuntimeDays } from "@/lib/funnel";
import { useApplicationsInput } from "@/lib/useApplicationsInput";
import { cn } from "@/lib/utils";

function CostTile({ metric }) {
  return (
    <div className="flex min-w-[152px] flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
            {formatCurrency(metric.daily)}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground">Daily</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-sm font-medium tabular-nums text-muted-foreground">
            {formatCurrency(metric.lifetime)}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground">Lifetime</span>
        </div>
      </div>

      <p className="text-xs leading-snug font-medium text-muted-foreground">{metric.sub}</p>

      <div className="flex flex-col gap-0.5 border-t border-border/60 pt-2 text-[0.68rem] text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <span>Laufzeit</span>
          <span className="font-mono tabular-nums text-foreground">
            {metric.runtimeDays != null ? `${metric.runtimeDays} Tage` : "–"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Anzahl</span>
          <span className="font-mono tabular-nums text-foreground">{formatNumber(metric.count)}</span>
        </div>
      </div>
    </div>
  );
}

function ReceivedApplicationsTile({ ad }) {
  const [value] = useApplicationsInput(ad.id);
  const totalCost = ad.order?.grossTotal != null ? Number(ad.order.grossTotal) : null;
  const runtimeDays = getRuntimeDays(ad);
  const count = value != null ? Number(value) : null;
  const hasCount = count != null && count > 0;
  const lifetime = totalCost != null && hasCount ? totalCost / count : null;
  const daily = lifetime != null && runtimeDays ? lifetime / runtimeDays : null;

  return (
    <div className="flex min-w-[152px] flex-1 flex-col gap-2 rounded-xl border-2 border-[var(--sg-gold-700)]/50 bg-[var(--sg-gold-100)]/40 p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--sg-gold-900)]">
        <ClipboardCheck className="size-3.5" />
        Kosten pro eingegangener Bewerbung
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(daily)}</span>
          <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground">Daily</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-heading text-sm font-medium tabular-nums text-muted-foreground">{formatCurrency(lifetime)}</span>
          <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground">Lifetime</span>
        </div>
      </div>

      <p className="text-xs leading-snug font-medium text-muted-foreground">Gesamtkosten / Eingegangene Bewerbungen</p>

      <div className="flex flex-col gap-0.5 border-t border-[var(--sg-gold-700)]/25 pt-2 text-[0.68rem] text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <span>Laufzeit</span>
          <span className="font-mono tabular-nums text-foreground">{runtimeDays != null ? `${runtimeDays} Tage` : "–"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Anzahl</span>
          <span className="font-mono tabular-nums text-foreground">{formatNumber(count)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CostMetrics({ ad, className }) {
  const metrics = buildCostMetrics(ad);

  return (
    <div className={cn("flex flex-wrap items-stretch gap-2", className)}>
      {metrics.map((metric) => (
        <CostTile key={metric.key} metric={metric} />
      ))}
      <ReceivedApplicationsTile ad={ad} />
    </div>
  );
}
