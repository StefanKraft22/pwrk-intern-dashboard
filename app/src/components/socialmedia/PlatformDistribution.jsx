import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { campaign, formatPercent, PLATFORM_META } from "@/lib/socialMedia";

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="inline-block size-2 rounded-full" style={{ background: p.payload.color }} />
        <span className="font-medium text-foreground">{p.name}</span>
      </div>
      <p className="mt-1 text-muted-foreground">{formatPercent(p.value)}</p>
    </div>
  );
}

export default function PlatformDistribution() {
  const data = campaign.platforms.map((p) => ({ name: PLATFORM_META[p.key].name, value: p.share, color: PLATFORM_META[p.key].color, key: p.key }));
  const totalImpressions = campaign.kpis.impressions.value;

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer height={200} width="100%">
          <PieChart>
            <Pie cx="50%" cy="50%" data={data} dataKey="value" endAngle={-270} innerRadius={62} outerRadius={88} paddingAngle={2} startAngle={90}>
              {data.map((entry) => (
                <Cell fill={entry.color} key={entry.key} stroke="var(--card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-xl font-semibold tabular-nums text-foreground">{totalImpressions.toLocaleString("de-DE")}</span>
          <span className="text-xs text-muted-foreground">Impressionen</span>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {campaign.platforms.map((p) => {
          const Icon = PLATFORM_META[p.key].Icon;
          return (
            <div className="flex items-center justify-between text-xs" key={p.key}>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="size-3.5" style={{ color: PLATFORM_META[p.key].color }} />
                {PLATFORM_META[p.key].name}
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground">{formatPercent(p.share)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
