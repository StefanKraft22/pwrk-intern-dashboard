import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ads from "@/data/advertisements.json";
import FunnelStages from "@/components/dashboard/FunnelStages";
import CostMetrics from "@/components/dashboard/CostMetrics";
import ClusterComparisonChart from "@/components/dashboard/ClusterComparisonChart";
import CombinedClusterChart from "@/components/dashboard/CombinedClusterChart";
import DailyClicksChart from "@/components/dashboard/DailyClicksChart";
import BoardPricingTable from "@/components/dashboard/BoardPricingTable";
import BoardBreakdown from "@/components/dashboard/BoardBreakdown";
import MetricTabs from "@/components/dashboard/MetricTabs";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildBoardBreakdown,
  buildBoardList,
  buildBoardPricing,
  buildClusterComparisonSeries,
  buildDailyCostSeries,
  buildDailySeries,
  buildLifetimeCostSeries,
  COST_METRICS,
  formatCurrency,
  formatDate,
  formatNumber,
  FUNNEL_STAGES,
  getBoardColor,
  getClusterScaleFactor,
  getRemainingRuntimeDays,
} from "@/lib/funnel";

const TAB_TRANSITION = "data-[state=active]:[animation:tab-flip-in_0.5s_cubic-bezier(0.22,1,0.36,1)]";

// Schaltet zwischen Gesamt- und Einzelwerten (je Stellenbörse) um — nur
// relevant, wenn mehrere Stellenbörsen gebucht sind.
function TotalsToggle({ checked, onCheckedChange }) {
  return (
    <label className="mb-2 flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      Nur Gesamtwerte
    </label>
  );
}

// Jede Chart-Karte hat ihre eigene, unabhängige Registerkarten-Auswahl —
// das Umschalten in einer Karte darf die Nachbar-Karte nicht mitändern.
function ClusterComparisonCard({ ad, boardBreakdown, TitleTag, titleClassName }) {
  const [metricKey, setMetricKey] = useState("clicks");
  const [onlyTotals, setOnlyTotals] = useState(false);
  const metricLabel = FUNNEL_STAGES.find((s) => s.key === metricKey)?.label ?? "Klicks";
  const clusterComparison = buildClusterComparisonSeries(ad, metricKey);
  const clusterFactor = getClusterScaleFactor(ad, metricKey) ?? 1;
  const clusterBoards = boardBreakdown.map((board) => ({
    ...board,
    series: board.series.map((point) => ({
      date: point.date,
      own: point.own != null ? Math.round(point.own * clusterFactor) : null,
    })),
  }));
  const chartBoards = onlyTotals ? [] : clusterBoards;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <TitleTag className={titleClassName}>{metricLabel} im Vergleich zu ähnlichen Anzeigen (Cluster)</TitleTag>
      </div>
      <MetricTabs onChange={setMetricKey} value={metricKey} />
      {boardBreakdown.length > 0 && <TotalsToggle checked={onlyTotals} onCheckedChange={setOnlyTotals} />}
      <p className="mb-3 text-xs text-muted-foreground">
        {metricKey === "clicks"
          ? "Grundlage der Effizienz: eigene Anzeige (kumuliert) vs. Median vergleichbarer Anzeigen im selben Skill-Cluster."
          : "Eigene Anzeige (kumuliert) vs. Median vergleichbarer Anzeigen im selben Skill-Cluster — geschätzt anhand der Klick-Verteilung, da für diese Kennzahl keine echten Vergleichsdaten vorliegen."}
      </p>
      <CombinedClusterChart boards={chartBoards} series={clusterComparison.series} />
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-navy-800)]" />
          Eigene Anzeige (gesamt)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--sg-gold-700)]" />
          Median ähnlicher Anzeigen
        </span>
        {!onlyTotals &&
          boardBreakdown.map((board, i) => (
            <span className="flex items-center gap-1.5" key={board.product}>
              <span className="inline-block h-0.5 w-3.5" style={{ background: getBoardColor(board.board, i) }} />
              Eigene Anzeige ({board.board})
            </span>
          ))}
      </div>
      {ad.cluster.min != null && metricKey === "clicks" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Ähnliche Anzeigen erreichten im Median {formatNumber(ad.cluster.median)} Klicks, bei einer Spanne von{" "}
          {formatNumber(ad.cluster.min)} bis {formatNumber(ad.cluster.max)}.
        </p>
      )}
    </Card>
  );
}

function DailyMetricsCard({ ad, boardBreakdown, TitleTag, titleClassName }) {
  const [metricKey, setMetricKey] = useState("clicks");
  const [onlyTotals, setOnlyTotals] = useState(false);
  const metricLabel = FUNNEL_STAGES.find((s) => s.key === metricKey)?.label ?? "Klicks";
  const dailySeries = buildDailySeries(ad, metricKey);
  const chartBoards = onlyTotals ? [] : boardBreakdown;

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <TitleTag className={titleClassName}>Tägliche {metricLabel}</TitleTag>
      </div>
      <MetricTabs onChange={setMetricKey} value={metricKey} />
      {boardBreakdown.length > 0 && <TotalsToggle checked={onlyTotals} onCheckedChange={setOnlyTotals} />}
      <p className="mb-3 text-xs text-muted-foreground">
        {dailySeries.isEstimated
          ? `Nicht kumuliert — ${metricLabel} je Tag, geschätzt anhand der Klick-Tagesverteilung (für diese Kennzahl liegen keine echten Tageswerte vor).`
          : `Nicht kumuliert — tatsächliche ${metricLabel} je Tag (eigene Messung).`}
        {boardBreakdown.length > 0 && !onlyTotals && " Gestapelt je Stellenbörse, geschätzte Aufteilung; Summe ergibt die Gesamt-Performance."}
      </p>
      <DailyClicksChart boards={chartBoards} data={dailySeries.data} />
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {onlyTotals ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-[var(--pw-navy-800)]" />
            Eigene Anzeige (gesamt)
          </span>
        ) : (
          boardBreakdown.map((board, i) => (
            <span className="flex items-center gap-1.5" key={board.product}>
              <span className="inline-block size-2.5 rounded-sm" style={{ background: getBoardColor(board.board, i) }} />
              {board.board}
            </span>
          ))
        )}
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-red-500)]" />
          Trend (Ø 7 Tage)
        </span>
      </div>
    </Card>
  );
}

// Daily- und Lifetime-Kostenverlauf als eigenständige Karten mit jeweils
// eigener Registerkarten-Auswahl (siehe ClusterComparisonCard/DailyMetricsCard).
// Kompakte, ungerundete Achsenbeschriftung (ohne Nachkommastellen), damit der
// höchste Wert nicht breiter ist als der reservierte Y-Achsen-Platz. Der
// Tooltip zeigt weiterhin den vollen, formatierten Betrag (formatCurrency).
function formatCurrencyTick(value) {
  return `${Math.round(value).toLocaleString("de-DE")} €`;
}

function CostTimeSeriesCard({ ad, title, buildSeries }) {
  const [metricKey, setMetricKey] = useState("clicks");
  const metricDef = COST_METRICS.find((m) => m.key === metricKey);
  const series = buildSeries(ad, metricKey);

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-heading text-sm font-medium">{title}</h3>
      </div>
      <MetricTabs onChange={setMetricKey} options={COST_METRICS} value={metricKey} />
      <p className="mb-3 text-xs text-muted-foreground">
        {metricDef?.sub}
        {series.isEstimated && " — geschätzt anhand der Klick-Tagesverteilung, da für diese Kennzahl keine echten Tageswerte vorliegen."}
      </p>
      <ClusterComparisonChart
        ownColor="var(--sg-blue-500)"
        ownLabel="Eigene Anzeige"
        series={series.data}
        tickFormatter={formatCurrencyTick}
        valueFormatter={formatCurrency}
      />
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 bg-[var(--sg-blue-500)]" />
          Eigene Anzeige
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--sg-gold-700)]" />
          Median ähnlicher Anzeigen
        </span>
      </div>
    </Card>
  );
}

export default function StellenanzeigeDetail() {
  const { id } = useParams();
  const ad = ads.find((a) => a.id === id);
  const boardPricing = ad ? buildBoardPricing(ad) : [];
  const boardBreakdown = ad ? buildBoardBreakdown(ad) : [];
  const boardList = ad ? buildBoardList(ad) : [];
  const maxRuntimeDays = Math.max(0, ...boardList.map((b) => b.days ?? 0));
  const maxRemainingDays = ad ? Math.max(0, ...boardList.map((b) => getRemainingRuntimeDays(ad.publicationStartDate, b.days) ?? 0)) : 0;

  if (!ad) {
    return (
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <p className="text-sm text-muted-foreground">Anzeige nicht gefunden.</p>
        <Link className="text-sm text-[var(--sg-blue-700)] underline" to="/stellenanzeigen">
          Zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <Link className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground" to="/stellenanzeigen">
        <ArrowLeft className="size-4" />
        Zur Übersicht
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-xl font-medium text-foreground">{ad.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Auftragsnr. {ad.order.number} · Schaltdatum {formatDate(ad.publicationStartDate)} {ad.city && `· ${ad.city}`}
        </p>
      </div>

      <Card className="mb-6 grid grid-cols-[repeat(6,max-content)] justify-between gap-y-1.5 p-5">
        <span className="text-xs font-medium text-muted-foreground">Auftragsnr.</span>
        <span className="text-xs font-medium text-muted-foreground">Rechnungsnr.</span>
        <span className="text-xs font-medium text-muted-foreground">Budget</span>
        <span className="text-xs font-medium text-muted-foreground">Laufzeit</span>
        <span className="text-xs font-medium text-muted-foreground">Restlaufzeit</span>
        <span className="text-xs font-medium text-muted-foreground">Gebuchtes Produkt</span>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">{ad.order.number}</p>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">{ad.order.invoiceNumber || "–"}</p>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">
          {ad.order.grossTotal ? `${Number(ad.order.grossTotal).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €` : "–"}
        </p>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">{maxRuntimeDays} Tage</p>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">{maxRemainingDays} Tage</p>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap text-foreground">
          {ad.products[0] || "–"}
          {ad.products.length > 1 && <span className="ml-1.5 text-sm font-medium text-muted-foreground">+{ad.products.length - 1} weitere</span>}
        </p>
      </Card>

      <Tabs defaultValue="uebersicht">
        <TabsList className="mb-6 w-fit items-stretch gap-1 rounded-none border-b-2 border-border bg-transparent p-0 group-data-horizontal/tabs:h-auto">
          <TabsTrigger
            className="rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:bg-muted-foreground/10 hover:text-foreground data-active:-mb-[2px] data-active:border-2 data-active:border-b-0 data-active:border-[var(--pw-navy-800)] data-active:bg-card data-active:px-[calc(1.25rem-1px)] data-active:pt-[calc(0.625rem-1px)] data-active:font-semibold data-active:text-foreground"
            value="uebersicht"
          >
            Übersicht
          </TabsTrigger>
          <TabsTrigger
            className="rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:bg-muted-foreground/10 hover:text-foreground data-active:-mb-[2px] data-active:border-2 data-active:border-b-0 data-active:border-[var(--pw-navy-800)] data-active:bg-card data-active:px-[calc(1.25rem-1px)] data-active:pt-[calc(0.625rem-1px)] data-active:font-semibold data-active:text-foreground"
            value="performance"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            className="rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:bg-muted-foreground/10 hover:text-foreground data-active:-mb-[2px] data-active:border-2 data-active:border-b-0 data-active:border-[var(--pw-navy-800)] data-active:bg-card data-active:px-[calc(1.25rem-1px)] data-active:pt-[calc(0.625rem-1px)] data-active:font-semibold data-active:text-foreground"
            value="kosten"
          >
            Kosten
          </TabsTrigger>
        </TabsList>

        <TabsContent className={TAB_TRANSITION} value="uebersicht">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ClusterComparisonCard TitleTag="h2" ad={ad} boardBreakdown={boardBreakdown} titleClassName="font-heading text-base font-medium" />
            <DailyMetricsCard TitleTag="h2" ad={ad} boardBreakdown={boardBreakdown} titleClassName="font-heading text-base font-medium" />
          </div>
        </TabsContent>

        <TabsContent className={TAB_TRANSITION} value="performance">
          <section className="mb-6 rounded-xl border border-[var(--pw-navy-800)]/20 bg-[var(--pw-navy-800)]/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--pw-navy-800)]" />
              <h2 className="font-heading text-base font-medium">Gesamt-Performance</h2>
            </div>
            <FunnelStages ad={ad} className="mb-5" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ClusterComparisonCard TitleTag="h3" ad={ad} boardBreakdown={boardBreakdown} titleClassName="font-heading text-sm font-medium" />
              <DailyMetricsCard TitleTag="h3" ad={ad} boardBreakdown={boardBreakdown} titleClassName="font-heading text-sm font-medium" />
            </div>
          </section>

          {boardBreakdown.length > 0 && (
            <section className="rounded-xl border border-[var(--sg-green-600)]/25 bg-[var(--sg-green-100)] p-5">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="size-2 rounded-full bg-[var(--sg-green-600)]" />
                <h2 className="font-heading text-base font-medium">Einzel-Performance je Stellenbörse</h2>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-muted-foreground">
                  Geschätzte Aufteilung
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Aufteilung der Gesamtwerte anteilig nach Laufzeit je gebuchtem Produkt, da keine separate Live-Messung je Börse vorliegt.
              </p>
              <BoardBreakdown entries={boardBreakdown} />
            </section>
          )}
        </TabsContent>

        <TabsContent className={TAB_TRANSITION} value="kosten">
          <section className="rounded-xl border border-[var(--pw-navy-800)]/20 bg-[var(--pw-navy-800)]/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--pw-navy-800)]" />
              <h2 className="font-heading text-base font-medium">Kosten-Kennzahlen</h2>
            </div>
            <CostMetrics ad={ad} className="mb-5" />

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CostTimeSeriesCard ad={ad} buildSeries={buildDailyCostSeries} title="Daily" />
              <CostTimeSeriesCard ad={ad} buildSeries={buildLifetimeCostSeries} title="Lifetime" />
            </div>

            <Card className="p-5">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-heading text-sm font-medium">Preise je Stellenbörse im Paket</h3>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                UVP und Paketpreis laut Preisliste je Stellenbörse. Anteil Budget: Anteil des UVP der Stellenbörse an allen UVPs im Paket.
                Anteilige Kosten je Kennzahl: nach diesem Anteil verteilter Preis, laufzeitgewichtet geschätzt.
              </p>
              <BoardPricingTable data={boardPricing} />
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
