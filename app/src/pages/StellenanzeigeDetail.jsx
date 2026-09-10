import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ads from "@/data/advertisements.json";
import FunnelStages from "@/components/dashboard/FunnelStages";
import ClusterComparisonChart from "@/components/dashboard/ClusterComparisonChart";
import { PassgenauigkeitBadge } from "@/components/dashboard/Passgenauigkeit";
import { Card } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/funnel";

export default function StellenanzeigeDetail() {
  const { id } = useParams();
  const ad = ads.find((a) => a.id === id);

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
        <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted-foreground">Auftragsnr.</span>
        <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted-foreground">Rechnungsnr.</span>
        <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted-foreground">Gesamtpreis</span>
        <span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted-foreground">Gebuchtes Produkt</span>
        <p className="font-mono text-[1.3125rem] whitespace-nowrap tabular-nums">{ad.order.number}</p>
        <p className="font-mono text-[1.3125rem] whitespace-nowrap tabular-nums">{ad.order.invoiceNumber || "–"}</p>
        <p className="font-mono text-[1.3125rem] whitespace-nowrap tabular-nums">
          {ad.order.grossTotal ? `${Number(ad.order.grossTotal).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €` : "–"}
        </p>
        <p className="text-[1.3125rem] whitespace-nowrap">{ad.products[0] || "–"}</p>
      </Card>

      <section className="mb-6">
        <h2 className="mb-4 font-heading text-base font-medium">Performance-Funnel</h2>
        <FunnelStages ad={ad} />
      </section>

      <section className="mb-6">
        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-heading text-base font-medium">Klicks im Vergleich zu ähnlichen Anzeigen (Cluster)</h2>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Grundlage der Passgenauigkeit: eigene Anzeige (kumuliert) vs. Median vergleichbarer Anzeigen im selben Skill-Cluster.
          </p>
          <ClusterComparisonChart series={ad.cluster.series} />
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-navy-800)]" />
              Eigene Anzeige
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--sg-gold-700)]" />
              Median ähnlicher Anzeigen
            </span>
          </div>
          {ad.cluster.min != null && (
            <p className="mt-3 text-xs text-muted-foreground">
              Ähnliche Anzeigen erreichten im Median {formatNumber(ad.cluster.median)} Klicks, bei einer Spanne von {formatNumber(ad.cluster.min)}{" "}
              bis {formatNumber(ad.cluster.max)}.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
