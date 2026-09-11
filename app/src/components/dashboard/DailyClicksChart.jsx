import { Bar, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getBoardColor } from "@/lib/funnel";

const TREND_WINDOW = 7;

function formatTick(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 font-medium text-foreground">{formatTick(label)}</p>
      {payload
        .slice()
        .reverse()
        .map((p) => (
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

// Teilt die tägliche Klickzahl je Tag anteilig auf die Börsen auf (gleiche
// Gewichtung wie buildBoardBreakdown), damit erste Börse + zweite Börse + ...
// wieder die Gesamt-Performance ergibt.
function buildStackedData(data, boards) {
  return data.map((point) => {
    const entry = { date: point.date };
    boards.forEach((board, i) => {
      entry[`board_${i}`] = point.value != null ? Math.round(point.value * board.weight) : null;
    });
    return entry;
  });
}

// Gleitender Durchschnitt über TREND_WINDOW Tage (zentriert) auf Basis der
// echten Gesamt-Tageswerte, unabhängig davon ob die Balken gestapelt sind.
function withTrend(chartData, totals) {
  return chartData.map((entry, i, arr) => {
    const start = Math.max(0, i - Math.floor(TREND_WINDOW / 2));
    const end = Math.min(arr.length, i + Math.ceil(TREND_WINDOW / 2));
    const slice = totals.slice(start, end).filter((v) => v != null);
    const avg = slice.length ? slice.reduce((sum, v) => sum + v, 0) / slice.length : null;
    return { ...entry, trend: avg != null ? Math.round(avg * 10) / 10 : null };
  });
}

export default function DailyClicksChart({ data, boards = [], color = "var(--pw-navy-800)" }) {
  if (!data?.length) {
    return <p className="text-sm text-muted-foreground">Keine Tagesdaten verfügbar.</p>;
  }
  const hasBoards = boards.length > 0;
  const totals = data.map((point) => point.value);
  const chartData = withTrend(hasBoards ? buildStackedData(data, boards) : data, totals);

  return (
    <ResponsiveContainer height={220} width="100%">
      <ComposedChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <XAxis
          axisLine={{ stroke: "var(--border)" }}
          dataKey="date"
          minTickGap={32}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickFormatter={formatTick}
          tickLine={false}
        />
        <YAxis axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} width={32} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
        {hasBoards ? (
          boards.map((board, i) => (
            <Bar dataKey={`board_${i}`} fill={getBoardColor(board.board, i)} key={board.product} name={board.board} stackId="daily" />
          ))
        ) : (
          <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
        )}
        <Line
          dataKey="trend"
          dot={false}
          name={`Trend (Ø ${TREND_WINDOW} Tage)`}
          stroke="var(--pw-red-500)"
          strokeWidth={2}
          type="monotone"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
