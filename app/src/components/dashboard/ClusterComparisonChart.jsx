import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function formatTick(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{formatTick(label)}</p>
      {payload.map((p) => (
        <div className="flex items-center justify-between gap-4" key={p.dataKey}>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block size-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-mono tabular-nums text-foreground">{p.value != null ? valueFormatter(p.value) : "–"}</span>
        </div>
      ))}
    </div>
  );
}

const defaultValueFormatter = (value) => value.toLocaleString("de-DE");

export default function ClusterComparisonChart({
  series,
  ownColor = "var(--pw-navy-800)",
  ownLabel = "Eigene Anzeige",
  showMedian = true,
  valueFormatter = defaultValueFormatter,
  tickFormatter = valueFormatter,
}) {
  if (!series?.length) {
    return <p className="text-sm text-muted-foreground">Keine Vergleichsdaten verfügbar.</p>;
  }
  return (
    <ResponsiveContainer height={220} width="100%">
      <LineChart data={series} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
        <XAxis dataKey="date" tickFormatter={formatTick} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} minTickGap={32} />
        <YAxis tick={{ fontSize: 10.5, fill: "var(--muted-foreground)" }} axisLine={false} tickFormatter={tickFormatter} tickLine={false} width={60} />
        <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
        <Line dataKey="own" name={ownLabel} stroke={ownColor} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        {showMedian && (
          <Line dataKey="clusterMedian" name="Median ähnlicher Anzeigen" stroke="var(--sg-gold-700)" strokeWidth={2} strokeDasharray="4 3" dot={false} activeDot={{ r: 4 }} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
