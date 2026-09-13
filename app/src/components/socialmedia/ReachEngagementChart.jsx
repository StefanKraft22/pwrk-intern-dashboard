import { useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { campaign } from "@/lib/socialMedia";

const SERIES = [
  { key: "reach", label: "Reichweite", color: "var(--pw-navy-800)", type: "bar", axis: "left" },
  { key: "impressions", label: "Impressionen", color: "var(--sg-blue-500)", type: "line", axis: "left" },
  { key: "engagements", label: "Engagements", color: "var(--sg-gold-700)", type: "line", axis: "right" },
  { key: "clicks", label: "Klicks", color: "var(--sg-terracotta-500)", type: "line", axis: "right" },
];

function formatTick(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function compactNumber(value) {
  return value.toLocaleString("de-DE");
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums text-foreground">{value?.toLocaleString("de-DE") ?? "–"}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1.5 font-medium text-foreground">
        {new Date(label).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
      </p>
      <div className="flex flex-col gap-0.5">
        <Row label="Reichweite" value={point.reach} />
        <Row label="Impressionen" value={point.impressions} />
        <Row label="Engagements" value={point.engagements} />
        <Row label="Klicks" value={point.clicks} />
        <Row label="Bewerbungen" value={point.applications} />
      </div>
    </div>
  );
}

// Serien können per Klick auf die Legende ein-/ausgeblendet werden.
export default function ReachEngagementChart() {
  const [hidden, setHidden] = useState(() => new Set());

  const toggle = (dataKey) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  return (
    <ResponsiveContainer height={300} width="100%">
      <ComposedChart data={campaign.dailySeries} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          axisLine={{ stroke: "var(--border)" }}
          dataKey="date"
          minTickGap={28}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickFormatter={formatTick}
          tickLine={false}
        />
        <YAxis axisLine={false} orientation="left" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={compactNumber} tickLine={false} width={52} yAxisId="left" />
        <YAxis axisLine={false} orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={compactNumber} tickLine={false} width={48} yAxisId="right" />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
        <Legend
          formatter={(value, entry) => (
            <span style={{ color: hidden.has(entry.dataKey) ? "var(--muted-foreground)" : "var(--foreground)", cursor: "pointer", fontSize: 12 }}>{value}</span>
          )}
          iconType="circle"
          onClick={(entry) => toggle(entry.dataKey)}
          wrapperStyle={{ paddingTop: 8 }}
        />
        {SERIES.map((s) =>
          s.type === "bar" ? (
            <Bar dataKey={s.key} fill={s.color} hide={hidden.has(s.key)} key={s.key} maxBarSize={18} name={s.label} radius={[3, 3, 0, 0]} yAxisId={s.axis} />
          ) : (
            <Line activeDot={{ r: 4 }} dataKey={s.key} dot={false} hide={hidden.has(s.key)} key={s.key} name={s.label} stroke={s.color} strokeWidth={2} yAxisId={s.axis} />
          )
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
