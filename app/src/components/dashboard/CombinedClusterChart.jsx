import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getBoardColor } from "@/lib/funnel";

function formatTick(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function ChartTooltip({ active, payload, label }) {
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
          <span className="font-mono tabular-nums text-foreground">{p.value?.toLocaleString("de-DE") ?? "–"}</span>
        </div>
      ))}
    </div>
  );
}

// Führt die Gesamt-Serie und die (anteilig geschätzten) Eigene-Anzeige-Linien
// je Börse zu einem gemeinsamen Datensatz zusammen. Die Cluster-Mediane der
// Einzelanzeigen werden bewusst nicht mit angezeigt (nur Gesamt-Median).
function buildCombinedData(series, boards) {
  return series.map((point, i) => {
    const entry = { date: point.date, own: point.own, clusterMedian: point.clusterMedian };
    boards.forEach((board, boardIndex) => {
      entry[`board_${boardIndex}`] = board.series[i]?.own ?? null;
    });
    return entry;
  });
}

export default function CombinedClusterChart({ series, boards }) {
  if (!series?.length) {
    return <p className="text-sm text-muted-foreground">Keine Vergleichsdaten verfügbar.</p>;
  }
  const data = buildCombinedData(series, boards || []);

  return (
    <ResponsiveContainer height={240} width="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <XAxis dataKey="date" tickFormatter={formatTick} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} minTickGap={32} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip content={<ChartTooltip />} />
        <Line dataKey="own" name="Eigene Anzeige (gesamt)" stroke="var(--pw-navy-800)" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
        <Line dataKey="clusterMedian" name="Median ähnlicher Anzeigen" stroke="var(--sg-gold-700)" strokeWidth={3} strokeDasharray="4 3" dot={false} activeDot={{ r: 4 }} />
        {(boards || []).map((board, i) => (
          <Line
            dataKey={`board_${i}`}
            dot={false}
            key={board.product}
            name={`Eigene Anzeige (${board.board})`}
            stroke={getBoardColor(board.board, i)}
            strokeWidth={2}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
