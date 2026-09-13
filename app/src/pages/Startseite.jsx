import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ads from "@/data/advertisements.json";
import intervalKpis from "@/data/interval-kpis.json";
import customer from "@/data/customer.json";
import KpiCard from "@/components/dashboard/KpiCard";
import BausteinStatusleiste from "@/components/dashboard/BausteinStatusleiste";
import DailyClicksChart from "@/components/dashboard/DailyClicksChart";
import PortalRankingTable from "@/components/dashboard/PortalRankingTable";
import QualitySignalCard from "@/components/dashboard/QualitySignalCard";
import CostDonut from "@/components/dashboard/CostDonut";
import MetricTabs from "@/components/dashboard/MetricTabs";
import GlobalFilters, { ZEITRAUM_OPTIONS } from "@/components/layout/GlobalFilters";
import { EfficiencyBadge } from "@/components/dashboard/EfficiencyBadge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { readSetting } from "@/lib/settings";
import { generateRecommendations, PRIORITY_LABEL } from "@/lib/recommendations";
import {
  formatNumber,
  buildFunnel,
  computeAdEfficiency,
  buildPortfolioDailySeries,
  buildPortfolioBoardPerformance,
  computeQualityScore,
  buildBoardList,
  FUNNEL_STAGES,
  getBoardColor,
  getRemainingRuntimeDays,
} from "@/lib/funnel";

const monthly = intervalKpis.companies["1eeaa429-e2d0-6138-9dfe-bb92a790087d"].values;
const conversionRate = intervalKpis.companies["1eeaa429-e2d0-6138-9dfe-bb92a790087d"].conversionRate;

function ownVsExternalTotals(key) {
  let own = 0;
  let external = 0;
  for (const ad of ads) {
    if (ad.kpi[key]?.own != null) own += ad.kpi[key].own;
    if (ad.kpi[key]?.external != null) external += ad.kpi[key].external;
  }
  return { own, external };
}

const clicksTotals = ownVsExternalTotals("clicks");

const passCounts = ads.reduce(
  (acc, ad) => {
    const p = computeAdEfficiency(ad);
    if (p) acc[p.tier] += 1;
    return acc;
  },
  { top: 0, watch: 0, action: 0 }
);

const portfolioBoards = buildPortfolioBoardPerformance(ads);
const qualityScore = computeQualityScore(ads);
const topRecommendations = generateRecommendations().slice(0, 3);

const activeAds = ads.filter((ad) => ad.status === "active");
const scheduledAds = ads.filter((ad) => ad.status === "scheduled");
const endingSoonAds = activeAds.filter((ad) => {
  const boards = buildBoardList(ad);
  const remaining = Math.max(0, ...boards.map((b) => getRemainingRuntimeDays(ad.publicationStartDate, b.days) ?? 0));
  return remaining <= 7;
});

export default function Startseite() {
  const [zeitraum, setZeitraum] = useState(() => readSetting("defaultZeitraum", "all"));
  const [metricKey, setMetricKey] = useState("clicks");
  const metricLabel = FUNNEL_STAGES.find((s) => s.key === metricKey)?.label ?? "Klicks";
  const portfolioDailySeries = buildPortfolioDailySeries(ads, metricKey);

  const [topAdsMetric, setTopAdsMetric] = useState("clicks");
  const topAdsMetricLabel = FUNNEL_STAGES.find((s) => s.key === topAdsMetric)?.label ?? "Klicks";

  const topAds = useMemo(() => {
    const option = ZEITRAUM_OPTIONS.find((o) => o.key === zeitraum);
    const scoped =
      option?.days == null
        ? ads
        : ads.filter((ad) => {
            const days = (Date.now() - new Date(ad.publicationStartDate).getTime()) / 86400000;
            return days >= 0 && days <= option.days;
          });
    return [...scoped]
      .sort((a, b) => (buildFunnel(b).find((s) => s.key === topAdsMetric)?.value ?? 0) - (buildFunnel(a).find((s) => s.key === topAdsMetric)?.value ?? 0))
      .slice(0, 6);
  }, [zeitraum, topAdsMetric]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Herzlich willkommen, {customer.name}</h1>
      <p className="mb-4 text-sm text-muted-foreground">Übersicht über alle laufenden Stellenanzeigen und Kennzahlen — September 2026.</p>
      <GlobalFilters onChange={setZeitraum} value={zeitraum} />

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Buchungen (Monat)" value={formatNumber(monthly.advertisement_count)} />
        <KpiCard label="Conversion Rate" value={conversionRate.toLocaleString("de-DE", { maximumFractionDigits: 1 })} suffix="%" />
        <KpiCard label="Klicks (Monat)" value={formatNumber(monthly.clicks)} />
        <KpiCard label="Hits (Monat)" value={formatNumber(monthly.hits)} />
        <KpiCard label="Interaktionen (Monat)" value={formatNumber(monthly.interactions)} />
        <KpiCard label="Gestartete Bewerbungen (Monat)" value={formatNumber(monthly.interests)} />
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Performance im Zeitverlauf</h2>
        <Card className="p-5">
          <MetricTabs onChange={setMetricKey} value={metricKey} />
          <p className="mb-3 text-xs text-muted-foreground">
            {portfolioDailySeries.isEstimated
              ? `Tägliche ${metricLabel}, geschätzt anhand der Klick-Tagesverteilung über alle ${ads.length} Anzeigen (für diese Kennzahl liegen keine echten Tageswerte vor).`
              : `Tägliche ${metricLabel} (eigene Messung) über alle ${ads.length} Anzeigen summiert.`}
          </p>
          <DailyClicksChart color="var(--pw-navy-800)" data={portfolioDailySeries.data} />
        </Card>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Vorgangs-Cockpit</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <p className="font-heading text-xl font-semibold tabular-nums">{activeAds.length}</p>
            <p className="text-xs text-muted-foreground">Aktive Anzeigen</p>
          </Card>
          <Card className="p-4">
            <p className="font-heading text-xl font-semibold tabular-nums">{scheduledAds.length}</p>
            <p className="text-xs text-muted-foreground">Terminierte Anzeigen</p>
          </Card>
          <Card className={cn("p-4", endingSoonAds.length > 0 && "border-warning/30 bg-warning/5")}>
            <p className="font-heading text-xl font-semibold tabular-nums">{endingSoonAds.length}</p>
            <p className="text-xs text-muted-foreground">Restlaufzeit ≤ 7 Tage</p>
          </Card>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Portal-Performance</h2>
        <PortalRankingTable boards={portfolioBoards} />
      </section>

      {qualityScore && (
        <section className="mb-6">
          <h2 className="mb-2 font-heading text-sm font-medium">Qualitätssignal</h2>
          <QualitySignalCard
            bestConversionBoard={portfolioBoards.filter((b) => b.conversion != null).reduce((a, b) => ((b.conversion ?? 0) > (a?.conversion ?? 0) ? b : a), null)}
            quality={qualityScore}
            topBoard={portfolioBoards[0]}
          />
        </section>
      )}

      <section className="mb-6">
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-heading text-sm font-medium">Klicks gesamt — eigene Messung vs. Fremdmessung Börse</h2>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Summe über alle {ads.length} laufenden Anzeigen. Frühere Statistik-Ansicht zählte ausschließlich eigene Messung — hier beide
            Quellen sichtbar.
          </p>
          <div className="flex flex-wrap items-end gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Eigene Messung</p>
              <p className="font-heading text-2xl font-semibold tabular-nums">{formatNumber(clicksTotals.own)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fremdmessung Börse</p>
              <p className="font-heading text-2xl font-semibold tabular-nums text-muted-foreground">{formatNumber(clicksTotals.external)}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-sm font-medium">Effizienz aller laufenden Anzeigen</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card className="flex items-center gap-3 border-success/30 bg-success/5 p-4">
            <span className="size-2.5 rounded-full bg-success" />
            <div>
              <p className="font-heading text-xl font-semibold">{passCounts.top}</p>
              <p className="text-xs text-muted-foreground">Top</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 border-warning/30 bg-warning/5 p-4">
            <span className="size-2.5 rounded-full bg-warning" />
            <div>
              <p className="font-heading text-xl font-semibold">{passCounts.watch}</p>
              <p className="text-xs text-muted-foreground">Beobachten</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 border-destructive/30 bg-destructive/5 p-4">
            <span className="size-2.5 rounded-full bg-destructive" />
            <div>
              <p className="font-heading text-xl font-semibold">{passCounts.action}</p>
              <p className="text-xs text-muted-foreground">Handlungsbedarf</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-sm font-medium">Stärkste Anzeigen nach {topAdsMetricLabel}</h2>
          <Link className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground" to="/stellenanzeigen">
            Alle {ads.length} Anzeigen →
          </Link>
        </div>
        <MetricTabs onChange={setTopAdsMetric} value={topAdsMetric} />
        {topAds.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">Keine Anzeigen mit Schaltdatum in diesem Zeitraum.</Card>
        ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Stellentitel</th>
                <th className="px-4 py-3 text-right font-medium">{topAdsMetricLabel}</th>
                <th className="px-4 py-3 font-medium">Geschaltete Stellenbörsen</th>
                <th className="px-4 py-3 font-medium">Effizienz</th>
              </tr>
            </thead>
            <tbody>
              {topAds.map((ad) => {
                const value = buildFunnel(ad).find((s) => s.key === topAdsMetric)?.value ?? null;
                const boardList = buildBoardList(ad);
                return (
                  <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={ad.id}>
                    <td className="px-4 py-3">
                      <Link className="font-medium text-[var(--sg-blue-700)] underline decoration-dotted underline-offset-4" to={`/stellenanzeigen/${ad.id}`}>
                        {ad.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[0.62rem] tabular-nums">{formatNumber(value)}</td>
                    <td className="px-4 py-3">
                      {boardList.map((b, i) => (
                        <p className="flex items-center gap-1.5 whitespace-nowrap" key={`${b.board}-${i}`}>
                          <span className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: getBoardColor(b.board, i) }} />
                          {b.board}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <EfficiencyBadge ad={ad} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Kosten- und Budgetübersicht</h2>
        <Card className="p-5">
          <p className="mb-3 text-xs text-muted-foreground">
            Gesamtkosten je Börse über alle {ads.length} Anzeigen, laut Auftragswert. Bei Mehrbörsen-Anzeigen anteilig nach Laufzeit geschätzt.
          </p>
          <CostDonut boards={portfolioBoards} />
        </Card>
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-sm font-medium">Priorisierte Empfehlungen</h2>
          <Link className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground" to="/empfehlungen">
            Alle Empfehlungen →
          </Link>
        </div>
        {topRecommendations.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">Aktuell keine offenen Empfehlungen.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {topRecommendations.map((r) => (
              <Card className="p-4" key={r.id}>
                <span
                  className={cn(
                    "mb-2 inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wide",
                    r.priority === "hoch" && "border-destructive/40 bg-destructive/10 text-destructive",
                    r.priority === "mittel" && "border-warning/40 bg-warning/10 text-warning",
                    r.priority === "hinweis" && "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {PRIORITY_LABEL[r.priority]}
                </span>
                <p className="mb-1 font-heading text-sm font-medium text-foreground">{r.title}</p>
                <p className="mb-2 text-xs text-muted-foreground">{r.adTitle}</p>
                <Link className="text-xs font-medium text-[var(--sg-blue-700)] hover:underline" to="/empfehlungen">
                  Details ansehen →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-heading text-sm font-medium">Ihre HR-Suite-Bausteine</h2>
        <BausteinStatusleiste />
      </section>
    </div>
  );
}
