import { Link } from "react-router-dom";
import ads from "@/data/advertisements.json";
import SourceBadge from "@/components/dashboard/SourceBadge";
import { PassgenauigkeitBadge } from "@/components/dashboard/Passgenauigkeit";
import { Card } from "@/components/ui/card";
import { formatDate, formatNumber, resolveMainValue } from "@/lib/funnel";

const STATUS_STYLES = {
  active: "border-success/40 bg-success/10 text-success",
  scheduled: "border-[var(--sg-blue-500)]/40 bg-[var(--sg-blue-100)] text-[var(--sg-blue-700)]",
};

export default function Stellenanzeigen() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Stellenanzeigen</h1>
      <p className="mb-6 text-sm text-muted-foreground">{ads.length} laufende / terminierte Anzeigen. Hauptwert je Kennzahl folgt der Quellen-Regel aus Schritt 3.</p>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Schaltdatum</th>
              <th className="px-4 py-3 font-medium">Stellentitel</th>
              <th className="px-4 py-3 font-medium">Auftragsnr.</th>
              <th className="px-4 py-3 text-right font-medium">Klicks</th>
              <th className="px-4 py-3 font-medium">Quelle</th>
              <th className="px-4 py-3 text-right font-medium">Bewerbungs-Klicks</th>
              <th className="px-4 py-3 font-medium">Passgenauigkeit</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => {
              const clicks = resolveMainValue(ad.kpi.clicks);
              const appClicks = resolveMainValue(ad.kpi.applicationClicks);
              return (
                <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={ad.id}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wider ${STATUS_STYLES[ad.status] || ""}`}>
                      {ad.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums">{formatDate(ad.publicationStartDate)}</td>
                  <td className="px-4 py-3">
                    <Link className="font-medium text-[var(--sg-blue-700)] underline decoration-dotted underline-offset-4" to={`/stellenanzeigen/${ad.id}`}>
                      {ad.title}
                    </Link>
                    {ad.city && <span className="ml-2 text-xs text-muted-foreground">{ad.city}</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums">{ad.order.number}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(clicks.value)}</td>
                  <td className="px-4 py-3">
                    <SourceBadge source={clicks.source} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(appClicks.value)}</td>
                  <td className="px-4 py-3">
                    <PassgenauigkeitBadge ad={ad} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
