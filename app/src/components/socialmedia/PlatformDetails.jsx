import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/funnel";
import { campaign, formatEuro, formatPercent, PLATFORM_META } from "@/lib/socialMedia";

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[0.68rem] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export default function PlatformDetails() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {campaign.platforms.map((p) => {
        const meta = PLATFORM_META[p.key];
        const Icon = meta.Icon;
        return (
          <Card className="p-4" key={p.key}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: meta.color }}>
                <Icon className="size-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">{meta.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-y-2.5">
              <Stat label="Reichweite" value={formatNumber(p.reach)} />
              <Stat label="Engagement-Rate" value={formatPercent(p.engagementRate)} />
              <Stat label="Klicks" value={formatNumber(p.clicks)} />
              <Stat label="Bewerbungen" value={formatNumber(p.applications)} />
              <Stat label="Kosten/Bewerbung" value={formatEuro(p.costPerApplication)} />
              <Stat label="CTR" value={formatPercent(p.ctr)} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
