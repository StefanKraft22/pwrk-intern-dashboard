import ads from "@/data/advertisements.json";
import intervalKpis from "@/data/interval-kpis.json";
import { Card } from "@/components/ui/card";
import { formatNumber, resolveMainValue } from "@/lib/funnel";

const monthly = intervalKpis.companies["1eeaa429-e2d0-6138-9dfe-bb92a790087d"].values;
const conversionRate = intervalKpis.companies["1eeaa429-e2d0-6138-9dfe-bb92a790087d"].conversionRate;

function boardOf(productName) {
  if (!productName) return "Andere";
  const n = productName.toLowerCase();
  if (n.includes("stepstone")) return "stepstone.de";
  if (n.includes("meinestadt")) return "meinestadt.de";
  return "Andere";
}

function aggregateByBoard(metricKey) {
  const byBoard = {};
  for (const ad of ads) {
    const board = boardOf(ad.products[0]);
    const value = resolveMainValue(ad.kpi[metricKey]).value ?? 0;
    byBoard[board] = (byBoard[board] || 0) + value;
  }
  const rows = Object.entries(byBoard).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, v]) => s + v, 0);
  return { rows, total };
}

const clicksByBoard = aggregateByBoard("clicks");
const applicationClicksByBoard = aggregateByBoard("applicationClicks");
const multiBoardCount = ads.filter((a) => a.products.length > 1).length;

function BoardBreakdown({ title, hint, rows, total, barClass }) {
  return (
    <Card className="p-5">
      <h2 className="mb-1 font-heading text-base font-medium">{title}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{hint}</p>
      <div className="space-y-2">
        {rows.map(([board, value]) => (
          <div className="flex items-center gap-3" key={board}>
            <span className="w-28 shrink-0 text-sm">{board}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full ${barClass}`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-sm tabular-nums">{formatNumber(value)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Statistik() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Statistik-Übersicht</h1>
      <p className="mb-6 text-sm text-muted-foreground">September 2026 · alle laufenden Anzeigen, Hauptwert je Kennzahl.</p>

      <Card className="mb-6 overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Firma</th>
              <th className="px-4 py-3 text-right font-medium">Buchungen</th>
              <th className="px-4 py-3 text-right font-medium">Conversion Rate</th>
              <th className="px-4 py-3 text-right font-medium">Klicks</th>
              <th className="px-4 py-3 text-right font-medium">Hits</th>
              <th className="px-4 py-3 text-right font-medium">Interaktionen</th>
              <th className="px-4 py-3 text-right font-medium">Bewerbungs-Klicks</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-muted/30 font-medium">
              <td className="px-4 py-3">Landesbetrieb Bau und Immobilien Hessen (LBIH)</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(monthly.advertisement_count)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{conversionRate.toLocaleString("de-DE")} %</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(monthly.clicks)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(monthly.hits)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(monthly.interactions)}</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(monthly.interests)}</td>
            </tr>
          </tbody>
        </table>
        <p className="border-t border-border p-3 text-xs text-muted-foreground">
          Werte folgen ab sofort der Hauptwert-Regel aus Schritt 3 (eigene Messung oder Fremdmessung Börse, je nachdem was höher ist) —
          nicht mehr ausschließlich eigene Tracking-Daten wie zuvor.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BoardBreakdown
          barClass="bg-[var(--pw-navy-800)]"
          hint="Aggregiert über alle laufenden Anzeigen, Hauptwert je Anzeige (führendes Produkt)."
          rows={clicksByBoard.rows}
          title="Klicks nach Stellenbörse"
          total={clicksByBoard.total}
        />
        <BoardBreakdown
          barClass="bg-[var(--sg-blue-500)]"
          hint="Aggregiert über alle laufenden Anzeigen, Hauptwert je Anzeige (führendes Produkt)."
          rows={applicationClicksByBoard.rows}
          title="Bewerbungs-Klicks nach Stellenbörse"
          total={applicationClicksByBoard.total}
        />
      </div>
      {multiBoardCount > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {multiBoardCount} von {ads.length} Anzeigen laufen zusätzlich über einen zweiten Kanal (z. B. meinestadt.de, LTO.de) — die
          Kennzahlen werden pro Anzeige nicht kanalweise getrennt gemessen und daher dem führenden Produkt zugeordnet.
        </p>
      )}
    </div>
  );
}
