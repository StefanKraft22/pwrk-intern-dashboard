import { useState } from "react";
import ClusterComparisonChart from "@/components/dashboard/ClusterComparisonChart";
import MetricTabs from "@/components/dashboard/MetricTabs";
import { buildCostSeries, campaign, COST_METRIC_DEFS, formatEuro } from "@/lib/socialMedia";

function StatTile({ label, value }) {
  return (
    <div>
      <p className="text-[0.68rem] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

// Eigene Registerkarten-Auswahl je Karte (Daily/Lifetime unabhängig
// voneinander umschaltbar) — gleiches Prinzip wie bei den Kosten-Charts der
// Stellenanzeigen.
function CostSeriesCard({ view, title }) {
  const [metricKey, setMetricKey] = useState("cpc");
  const metricDef = COST_METRIC_DEFS.find((m) => m.key === metricKey);
  const series = buildCostSeries(view, metricKey);

  return (
    <div>
      <h3 className="mb-1 font-heading text-sm font-medium">{title}</h3>
      <MetricTabs onChange={setMetricKey} options={COST_METRIC_DEFS} value={metricKey} />
      <ClusterComparisonChart ownColor="var(--pw-navy-800)" ownLabel={metricDef.label} series={series} showMedian={false} valueFormatter={formatEuro} />
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
      <div className="mb-5 h-1.5 rounded-full bg-muted">
        <div className="h-1.5 rounded-full bg-[var(--pw-navy-800)]" style={{ width: `${spentPercent}%` }} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CostSeriesCard title="Daily" view="daily" />
        <CostSeriesCard title="Lifetime" view="lifetime" />
      </div>
    </div>
  );
}
