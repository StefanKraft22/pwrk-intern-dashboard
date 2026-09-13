import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import MetricTabs from "@/components/dashboard/MetricTabs";
import { campaign } from "@/lib/socialMedia";

const DIMENSIONS = [
  { key: "age", label: "Alter" },
  { key: "gender", label: "Geschlecht" },
  { key: "location", label: "Standort" },
  { key: "interests", label: "Interessen" },
];

const METRICS = [
  { key: "reach", label: "Reichweite", color: "var(--pw-navy-800)" },
  { key: "engagement", label: "Engagement", color: "var(--sg-gold-700)" },
  { key: "clicks", label: "Klicks", color: "var(--sg-blue-500)" },
  { key: "applications", label: "Bewerbungen", color: "var(--sg-terracotta-500)" },
];

function ChartTooltip({ active, payload, label, metricLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {metricLabel}: <span className="font-mono font-medium text-foreground">{payload[0].value.toLocaleString("de-DE")}</span>
      </p>
    </div>
  );
}

export default function AudiencePerformance() {
  const [dimension, setDimension] = useState("age");
  const [metric, setMetric] = useState("reach");
  const metricDef = METRICS.find((m) => m.key === metric);
  const data = campaign.audiencePerformance[dimension];

  return (
    <div>
      <MetricTabs onChange={setDimension} options={DIMENSIONS} value={dimension} />
      <MetricTabs onChange={setMetric} options={METRICS} value={metric} />
      <ResponsiveContainer height={260} width="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={{ stroke: "var(--border)" }}
            dataKey="segment"
            tick={{ fontSize: 10.5, fill: "var(--muted-foreground)" }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => v.toLocaleString("de-DE")} tickLine={false} width={52} />
          <Tooltip content={<ChartTooltip metricLabel={metricDef.label} />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey={metric} fill={metricDef.color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
