import { useState } from "react";
import { Building2 } from "lucide-react";
import SourceBadge from "./SourceBadge";
import ClusterComparisonChart from "./ClusterComparisonChart";
import DailyClicksChart from "./DailyClicksChart";
import MetricTabs from "./MetricTabs";
import { formatNumber, FUNNEL_STAGES, getBoardColor } from "@/lib/funnel";

function scaleClusterSeries(series, factor) {
  if (factor === 1) return series;
  return series.map((point) => ({
    date: point.date,
    own: point.own != null ? Math.round(point.own * factor) : null,
    clusterMedian: point.clusterMedian != null ? Math.round(point.clusterMedian * factor) : null,
  }));
}

function scaleDailySeries(data, factor) {
  if (factor === 1) return data;
  return data.map((point) => ({ date: point.date, value: point.value != null ? Math.round(point.value * factor) : null }));
}

function StageTile({ stage }) {
  return (
    <div className="flex min-w-[152px] flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex min-h-8 items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
      </div>

      <div className="min-h-9 font-heading text-2xl font-semibold tabular-nums text-foreground">
        {stage.isMissingCritical ? (
          <span className="text-sm font-normal text-muted-foreground">Es liegen keine Daten vor. Eine Schätzung wäre zu ungenau.</span>
        ) : (
          formatNumber(stage.value)
        )}
      </div>

      <div className="min-h-[18px]">{!stage.isMissingCritical && <SourceBadge source={stage.source} />}</div>

      <p className="text-[0.72rem] leading-snug text-muted-foreground">{stage.sub}</p>
    </div>
  );
}

// Eigene, unabhängige Registerkarten-Auswahl je Chart-Karte — das Umschalten
// einer Karte darf die Nachbar-Karte nicht mitändern.
function BoardClusterCard({ entry, color }) {
  const [metricKey, setMetricKey] = useState("clicks");
  const metricLabel = FUNNEL_STAGES.find((s) => s.key === metricKey)?.label ?? "Klicks";
  const isEstimated = metricKey !== "clicks";
  const boardClicksTotal = entry.series[entry.series.length - 1]?.own;
  const boardMetricTotal = entry.stages.find((s) => s.key === metricKey)?.value;
  const clusterFactor = !isEstimated || !boardClicksTotal || boardMetricTotal == null ? 1 : boardMetricTotal / boardClicksTotal;
  const clusterSeries = isEstimated ? scaleClusterSeries(entry.series, clusterFactor) : entry.series;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-xs font-medium text-muted-foreground">
        {metricLabel} im Vergleich zu ähnlichen Anzeigen — {entry.board}
      </h3>
      <MetricTabs onChange={setMetricKey} value={metricKey} />
      {isEstimated && (
        <p className="mb-1 text-[0.7rem] leading-snug text-muted-foreground">
          Geschätzt anhand der Klick-Verteilung, da für diese Kennzahl keine echten Vergleichsdaten vorliegen.
        </p>
      )}
      <ClusterComparisonChart ownColor={color} ownLabel={`Eigene Anzeige (${entry.board})`} series={clusterSeries} />
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5" style={{ background: color }} />
          Eigene Anzeige
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--sg-gold-700)]" />
          Median ähnlicher Anzeigen
        </span>
      </div>
    </div>
  );
}

function BoardDailyCard({ entry, color }) {
  const [metricKey, setMetricKey] = useState("clicks");
  const metricLabel = FUNNEL_STAGES.find((s) => s.key === metricKey)?.label ?? "Klicks";
  const isEstimated = metricKey !== "clicks";
  const boardDailyClicksTotal = entry.dailyClicks.reduce((sum, p) => sum + (p.value ?? 0), 0);
  const boardMetricTotal = entry.stages.find((s) => s.key === metricKey)?.value;
  const dailyFactor = !isEstimated || !boardDailyClicksTotal || boardMetricTotal == null ? 1 : boardMetricTotal / boardDailyClicksTotal;
  const dailyData = isEstimated ? scaleDailySeries(entry.dailyClicks, dailyFactor) : entry.dailyClicks;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-xs font-medium text-muted-foreground">
        Tägliche {metricLabel} — {entry.board}
      </h3>
      <MetricTabs onChange={setMetricKey} value={metricKey} />
      <p className="mb-3 text-[0.7rem] leading-snug text-muted-foreground">
        {isEstimated
          ? "Nicht kumuliert, geschätzt anhand der Klick-Tagesverteilung (für diese Kennzahl liegen keine echten Tageswerte vor)."
          : "Nicht kumuliert, geschätzter Anteil an der Gesamt-Performance."}
      </p>
      <DailyClicksChart color={color} data={dailyData} />
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
          {entry.board}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-red-500)]" />
          Trend (Ø 7 Tage)
        </span>
      </div>
    </div>
  );
}

function BoardBlock({ entry, color }) {
  return (
    <div className="rounded-xl border border-border bg-white/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: color }}>
            <Building2 className="size-3.5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{entry.board}</p>
            <p className="text-[0.7rem] text-muted-foreground">{entry.product.trim()}</p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-muted-foreground">
          ≈ {Math.round(entry.weight * 100)}% Anteil · geschätzt
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {entry.stages.map((stage) => (
          <StageTile key={stage.key} stage={stage} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BoardClusterCard color={color} entry={entry} />
        <BoardDailyCard color={color} entry={entry} />
      </div>
    </div>
  );
}

export default function BoardBreakdown({ entries }) {
  if (!entries?.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => (
        <BoardBlock color={getBoardColor(entry.board, i)} entry={entry} key={entry.product} />
      ))}
    </div>
  );
}
