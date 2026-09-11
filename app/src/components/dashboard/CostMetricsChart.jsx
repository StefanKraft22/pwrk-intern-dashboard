import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

// Personalwerk-Blau-Rampe 700 -> 100 (Farben Styleguide_Personalwerk.pdf).
const PW_BLUE_SHADES = ["var(--sg-blue-700)", "var(--sg-blue-500)", "var(--sg-blue-300)", "var(--sg-blue-200)", "var(--sg-blue-100)"];

function formatCurrency(value) {
  if (value == null) return "–";
  return `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function formatTick(value) {
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 2 })}€`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div className="flex items-center justify-between gap-4" key={p.dataKey}>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-mono tabular-nums text-foreground">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function MetricBarChart({ title, metrics, dataKey, medianKey }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium text-muted-foreground">{title}</h3>
      <ResponsiveContainer height={220} width="100%">
        <BarChart data={metrics} margin={{ top: 20, right: 12, bottom: 0, left: 0 }}>
          <XAxis axisLine={{ stroke: "var(--border)" }} dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} />
          <YAxis axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={formatTick} tickLine={false} width={64} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey={dataKey} name="Eigene Anzeige" radius={[4, 4, 0, 0]}>
            {metrics.map((metric, i) => (
              <Cell fill={PW_BLUE_SHADES[i % PW_BLUE_SHADES.length]} key={metric.key} />
            ))}
          </Bar>
          <Bar dataKey={medianKey} fill="var(--sg-gold-300)" name="Median ähnlicher Anzeigen" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CostMetricsChart({ metrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="p-5">
        <MetricBarChart dataKey="daily" medianKey="medianDaily" metrics={metrics} title="Daily" />
      </Card>
      <Card className="p-5">
        <MetricBarChart dataKey="lifetime" medianKey="medianLifetime" metrics={metrics} title="Lifetime" />
      </Card>
    </div>
  );
}
