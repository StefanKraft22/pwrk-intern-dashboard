import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { campaign, formatEuro } from "@/lib/socialMedia";

function formatTick(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{new Date(label).toLocaleDateString("de-DE", { day: "2-digit", month: "long" })}</p>
      <div className="flex flex-col gap-0.5">
        <Row label="Kosten" value={formatEuro(point.cost, 0)} />
        <Row label="CPC" value={formatEuro(point.cpc)} />
        <Row label="CPA" value={formatEuro(point.cpa)} />
      </div>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div>
      <p className="text-[0.68rem] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export default function CostEfficiency() {
  const c = campaign.costEfficiency;
  const spentPercent = Math.round((c.spent / c.budget) * 100);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Budget" value={formatEuro(c.budget, 0)} />
        <StatTile label="Ausgegeben" value={formatEuro(c.spent, 0)} />
        <StatTile label="Verbleibend" value={formatEuro(c.remaining, 0)} />
        <StatTile label="Budgetverbrauch" value={`${spentPercent} %`} />
        <StatTile label="CPM" value={formatEuro(c.cpm)} />
        <StatTile label="CPC" value={formatEuro(c.cpc)} />
        <StatTile label="CPA (Kosten/Bewerbung)" value={formatEuro(c.cpa)} />
        <StatTile label="Cost per Qualified Application" value={formatEuro(c.cpqa)} />
      </div>
      <div className="mb-4 h-1.5 rounded-full bg-muted">
        <div className="h-1.5 rounded-full bg-[var(--pw-navy-800)]" style={{ width: `${spentPercent}%` }} />
      </div>
      <ResponsiveContainer height={220} width="100%">
        <ComposedChart data={c.dailySeries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={{ stroke: "var(--border)" }}
            dataKey="date"
            minTickGap={28}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={formatTick}
            tickLine={false}
          />
          <YAxis axisLine={false} orientation="left" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v} €`} tickLine={false} width={48} yAxisId="left" />
          <YAxis axisLine={false} orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v} €`} tickLine={false} width={44} yAxisId="right" />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="cost" fill="var(--sg-blue-200)" name="Kosten" radius={[3, 3, 0, 0]} yAxisId="left" />
          <Line dataKey="cpc" dot={false} name="CPC" stroke="var(--pw-navy-800)" strokeWidth={2} yAxisId="right" />
          <Line dataKey="cpa" dot={false} name="CPA" stroke="var(--sg-terracotta-500)" strokeWidth={2} yAxisId="right" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm bg-[var(--sg-blue-200)]" />
          Kosten
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-navy-800)]" />
          CPC
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[var(--sg-terracotta-500)]" />
          CPA
        </span>
      </div>
    </div>
  );
}
