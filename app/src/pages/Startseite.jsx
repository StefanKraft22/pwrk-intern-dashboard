import { Link } from "react-router-dom";
import ads from "@/data/advertisements.json";
import intervalKpis from "@/data/interval-kpis.json";
import customer from "@/data/customer.json";
import KpiCard from "@/components/dashboard/KpiCard";
import BausteinStatusleiste from "@/components/dashboard/BausteinStatusleiste";
import { PassgenauigkeitBadge } from "@/components/dashboard/Passgenauigkeit";
import SourceBadge from "@/components/dashboard/SourceBadge";
import { Card } from "@/components/ui/card";
import { resolveMainValue, formatNumber, computePassgenauigkeit } from "@/lib/funnel";

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

const topAds = [...ads]
  .sort((a, b) => (resolveMainValue(b.kpi.clicks).value ?? 0) - (resolveMainValue(a.kpi.clicks).value ?? 0))
  .slice(0, 6);

const passCounts = ads.reduce(
  (acc, ad) => {
    const p = computePassgenauigkeit(ad);
    if (p) acc[p.tier] += 1;
    return acc;
  },
  { top: 0, watch: 0, action: 0 }
);

export default function Startseite() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Herzlich willkommen, {customer.name}</h1>
      <p className="mb-6 text-sm text-muted-foreground">Übersicht über alle laufenden Stellenanzeigen und Kennzahlen — September 2026.</p>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Buchungen (Monat)" value={formatNumber(monthly.advertisement_count)} />
        <KpiCard label="Conversion Rate" value={conversionRate.toLocaleString("de-DE", { maximumFractionDigits: 1 })} suffix="%" />
        <KpiCard label="Klicks (Monat)" value={formatNumber(monthly.clicks)} />
        <KpiCard label="Hits (Monat)" value={formatNumber(monthly.hits)} />
        <KpiCard label="Interaktionen (Monat)" value={formatNumber(monthly.interactions)} />
        <KpiCard label="Gestartete Bewerbungen (Monat)" value={formatNumber(monthly.interests)} />
      </section>

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
          <h2 className="font-heading text-sm font-medium">Passgenauigkeit aller laufenden Anzeigen</h2>
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
          <h2 className="font-heading text-sm font-medium">Stärkste Anzeigen nach Klicks</h2>
          <Link className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground" to="/stellenanzeigen">
            Alle {ads.length} Anzeigen →
          </Link>
        </div>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Stellentitel</th>
                <th className="px-4 py-3 text-right font-medium">Klicks</th>
                <th className="px-4 py-3 font-medium">Quelle</th>
                <th className="px-4 py-3 font-medium">Passgenauigkeit</th>
              </tr>
            </thead>
            <tbody>
              {topAds.map((ad) => {
                const resolved = resolveMainValue(ad.kpi.clicks);
                return (
                  <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={ad.id}>
                    <td className="px-4 py-3">
                      <Link className="font-medium text-[var(--sg-blue-700)] underline decoration-dotted underline-offset-4" to={`/stellenanzeigen/${ad.id}`}>
                        {ad.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(resolved.value)}</td>
                    <td className="px-4 py-3">
                      <SourceBadge source={resolved.source} />
                    </td>
                    <td className="px-4 py-3">
                      <PassgenauigkeitBadge ad={ad} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 font-heading text-sm font-medium">Ihre HR-Suite-Bausteine</h2>
        <BausteinStatusleiste />
      </section>
    </div>
  );
}
