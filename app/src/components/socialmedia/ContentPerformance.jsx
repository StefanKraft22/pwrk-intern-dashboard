import { formatNumber } from "@/lib/funnel";
import { campaign, formatEuro, formatPercent } from "@/lib/socialMedia";

export default function ContentPerformance() {
  const items = [...campaign.contentPerformance].sort((a, b) => b.reach - a.reach);
  const max = items[0].reach;

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item) => (
        <div key={item.type}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-foreground">{item.type}</span>
            <span className="font-mono tabular-nums text-muted-foreground">{formatNumber(item.reach)} Reichweite</span>
          </div>
          <div className="mb-1.5 h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-[var(--pw-navy-800)]" style={{ width: `${(item.reach / max) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[0.68rem] text-muted-foreground">
            <span>
              Engagement-Rate: <span className="font-mono font-medium text-foreground">{formatPercent(item.engagementRate)}</span>
            </span>
            <span>
              CTR: <span className="font-mono font-medium text-foreground">{formatPercent(item.ctr)}</span>
            </span>
            <span>
              Bewerbungen: <span className="font-mono font-medium text-foreground">{formatNumber(item.applications)}</span>
            </span>
            <span>
              Kosten/Bewerbung: <span className="font-mono font-medium text-foreground">{formatEuro(item.costPerApplication)}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
