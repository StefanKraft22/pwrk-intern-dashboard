import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ads from "@/data/advertisements.json";
import FunnelStages from "@/components/dashboard/FunnelStages";
import CostMetrics from "@/components/dashboard/CostMetrics";
import CostMetricsChart from "@/components/dashboard/CostMetricsChart";
import CombinedClusterChart from "@/components/dashboard/CombinedClusterChart";
import DailyClicksChart from "@/components/dashboard/DailyClicksChart";
import BoardPricingTable from "@/components/dashboard/BoardPricingTable";
import BoardBreakdown from "@/components/dashboard/BoardBreakdown";
import { PassgenauigkeitBadge } from "@/components/dashboard/Passgenauigkeit";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildBoardBreakdown, buildBoardPricing, buildCostMetrics, formatDate, formatNumber, getBoardColor } from "@/lib/funnel";

export default function StellenanzeigeDetail() {
  const { id } = useParams();
  const ad = ads.find((a) => a.id === id);
  const boardPricing = ad ? buildBoardPricing(ad) : [];
  const costMetrics = ad ? buildCostMetrics(ad) : [];
  const boardBreakdown = ad ? buildBoardBreakdown(ad) : [];

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

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-medium text-foreground">{ad.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Auftragsnr. {ad.order.number} · Schaltdatum {formatDate(ad.publicationStartDate)} {ad.city && `· ${ad.city}`}
          </p>
        </div>
        <PassgenauigkeitBadge ad={ad} />
      </div>

      <Card className="mb-6 grid grid-cols-[repeat(4,max-content)] justify-between gap-y-1.5 p-5">
        <span className="text-xs font-medium text-muted-foreground">Auftragsnr.</span>
        <span className="text-xs font-medium text-muted-foreground">Rechnungsnr.</span>
        <span className="text-xs font-medium text-muted-foreground">Gesamtpreis</span>
        <span className="text-xs font-medium text-muted-foreground">Gebuchtes Produkt</span>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">{ad.order.number}</p>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">{ad.order.invoiceNumber || "–"}</p>
        <p className="font-heading text-[1.3125rem] font-semibold whitespace-nowrap tabular-nums text-foreground">
          {ad.order.grossTotal ? `${Number(ad.order.grossTotal).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €` : "–"}
        </p>
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

        <TabsContent value="uebersicht">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium">Klicks im Vergleich zu ähnlichen Anzeigen (Cluster)</h2>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Grundlage der Passgenauigkeit: eigene Anzeige (kumuliert) vs. Median vergleichbarer Anzeigen im selben Skill-Cluster.
              </p>
              <CombinedClusterChart boards={boardBreakdown} series={ad.cluster.series} />
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-navy-800)]" />
                  Eigene Anzeige (gesamt)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--sg-gold-700)]" />
                  Median ähnlicher Anzeigen
                </span>
                {boardBreakdown.map((board, i) => (
                  <span className="flex items-center gap-1.5" key={board.product}>
                    <span className="inline-block h-0.5 w-3.5" style={{ background: getBoardColor(board.board, i) }} />
                    Eigene Anzeige ({board.board})
                  </span>
                ))}
              </div>
              {ad.cluster.min != null && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Ähnliche Anzeigen erreichten im Median {formatNumber(ad.cluster.median)} Klicks, bei einer Spanne von{" "}
                  {formatNumber(ad.cluster.min)} bis {formatNumber(ad.cluster.max)}.
                </p>
              )}
            </Card>

            <Card className="p-5">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium">Tägliche Klicks</h2>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Nicht kumuliert — tatsächliche Klicks je Tag (eigene Messung).
                {boardBreakdown.length > 0 && " Gestapelt je Stellenbörse, geschätzte Aufteilung; Summe ergibt die Gesamt-Performance."}
              </p>
              <DailyClicksChart boards={boardBreakdown} data={ad.dailyClicksOwn} />
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                {boardBreakdown.map((board, i) => (
                  <span className="flex items-center gap-1.5" key={board.product}>
                    <span className="inline-block size-2.5 rounded-sm" style={{ background: getBoardColor(board.board, i) }} />
                    {board.board}
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-red-500)]" />
                  Trend (Ø 7 Tage)
                </span>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <section className="mb-6 rounded-xl border border-[var(--pw-navy-800)]/20 bg-[var(--pw-navy-800)]/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--pw-navy-800)]" />
              <h2 className="font-heading text-base font-medium">Gesamt-Performance</h2>
            </div>
            <FunnelStages ad={ad} className="mb-5" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-medium">Klicks im Vergleich zu ähnlichen Anzeigen (Cluster)</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Grundlage der Passgenauigkeit: eigene Anzeige (kumuliert) vs. Median vergleichbarer Anzeigen im selben Skill-Cluster.
                </p>
                <CombinedClusterChart boards={boardBreakdown} series={ad.cluster.series} />
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-navy-800)]" />
                    Eigene Anzeige (gesamt)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--sg-gold-700)]" />
                    Median ähnlicher Anzeigen
                  </span>
                  {boardBreakdown.map((board, i) => (
                    <span className="flex items-center gap-1.5" key={board.product}>
                      <span className="inline-block h-0.5 w-3.5" style={{ background: getBoardColor(board.board, i) }} />
                      Eigene Anzeige ({board.board})
                    </span>
                  ))}
                </div>
                {ad.cluster.min != null && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Ähnliche Anzeigen erreichten im Median {formatNumber(ad.cluster.median)} Klicks, bei einer Spanne von{" "}
                    {formatNumber(ad.cluster.min)} bis {formatNumber(ad.cluster.max)}.
                  </p>
                )}
              </Card>

              <Card className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-medium">Tägliche Klicks</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Nicht kumuliert — tatsächliche Klicks je Tag (eigene Messung).
                  {boardBreakdown.length > 0 && " Gestapelt je Stellenbörse, geschätzte Aufteilung; Summe ergibt die Gesamt-Performance."}
                </p>
                <DailyClicksChart boards={boardBreakdown} data={ad.dailyClicksOwn} />
                {boardBreakdown.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {boardBreakdown.map((board, i) => (
                      <span className="flex items-center gap-1.5" key={board.product}>
                        <span className="inline-block size-2.5 rounded-sm" style={{ background: getBoardColor(board.board, i) }} />
                        {board.board}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
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
              <BoardBreakdown adId={ad.id} entries={boardBreakdown} />
            </section>
          )}
        </TabsContent>

        <TabsContent value="kosten">
          <section className="rounded-xl border border-[var(--pw-navy-800)]/20 bg-[var(--pw-navy-800)]/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-[var(--pw-navy-800)]" />
              <h2 className="font-heading text-base font-medium">Kosten-Kennzahlen</h2>
            </div>
            <CostMetrics ad={ad} className="mb-5" />

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-sm font-medium">Daily vs. Lifetime im Vergleich</h3>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Getrennte Skalen, da Daily-Werte durch die Laufzeit-Aufteilung deutlich kleiner ausfallen als Lifetime-Werte. Median-Kosten hochgerechnet:
                gleiches Budget bei median-üblicher Klickzahl.
              </p>
              <CostMetricsChart metrics={costMetrics} />
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-[var(--sg-blue-500)]" />
                  Eigene Anzeige
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-2.5 rounded-sm bg-[var(--sg-gold-300)]" />
                  Median ähnlicher Anzeigen
                </span>
              </div>
            </div>

            <Card className="p-5">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-heading text-sm font-medium">Preise je Stellenbörse im Paket</h3>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                UVP und Paketpreis laut Preisliste je Stellenbörse. Anteil Gesamtpreis: tatsächlich gezahlter Preis, verteilt nach UVP-Anteil der
                Stellenbörse an allen UVPs im Paket. TKP: anteiliger Preis je 1.000 Impressions, laufzeitgewichtet geschätzt.
              </p>
              <BoardPricingTable data={boardPricing} />
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
