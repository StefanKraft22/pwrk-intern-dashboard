import { getBoardColor, formatNumber, formatCurrency } from "@/lib/funnel";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Badge({ children }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full border border-[var(--sg-green-600)]/40 bg-[var(--sg-green-100)] px-1.5 py-0.5 font-mono text-[0.58rem] font-medium uppercase tracking-wide text-[var(--sg-green-900)]">
      {children}
    </span>
  );
}

export default function PortalRankingTable({ boards, onRowClick, selectedBoard }) {
  if (!boards.length) return <p className="text-sm text-muted-foreground">Keine Börsen-Daten verfügbar.</p>;

  const topVolume = boards.reduce((a, b) => (b.clicks > a.clicks ? b : a));
  const topConversion = boards.filter((b) => b.conversion != null).reduce((a, b) => ((b.conversion ?? 0) > (a?.conversion ?? 0) ? b : a), null);
  const lowestCpa = boards.filter((b) => b.cpa != null).reduce((a, b) => ((b.cpa ?? Infinity) < (a?.cpa ?? Infinity) ? b : a), null);
  const hasEstimated = boards.some((b) => b.hasEstimatedContribution);

  return (
    <div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Börse</th>
              <th className="px-4 py-3 text-right font-medium">Anzeigen</th>
              <th className="px-4 py-3 text-right font-medium">Klicks</th>
              <th className="px-4 py-3 text-right font-medium">Bewerbungen</th>
              <th className="px-4 py-3 text-right font-medium">Conversion</th>
              <th className="px-4 py-3 text-right font-medium">Kosten</th>
              <th className="px-4 py-3 text-right font-medium">CPA</th>
            </tr>
          </thead>
          <tbody>
            {boards.map((b, i) => (
              <tr
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/40",
                  onRowClick && "cursor-pointer",
                  selectedBoard === b.board && "bg-muted/60"
                )}
                key={b.board}
                onClick={() => onRowClick?.(b.board)}
              >
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: getBoardColor(b.board, i) }} />
                    {b.board}
                    {b === topVolume && <Badge>Meiste Klicks</Badge>}
                    {b === topConversion && <Badge>Beste Conversion</Badge>}
                    {b === lowestCpa && <Badge>Niedrigster CPA</Badge>}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{b.adCount}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(b.clicks)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(b.applications)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{b.conversion != null ? `${(b.conversion * 100).toFixed(1)} %` : "–"}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{formatCurrency(b.cost)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{b.cpa != null ? formatCurrency(b.cpa) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {hasEstimated && (
        <p className="mt-2 text-xs text-muted-foreground">
          Bei Anzeigen mit mehreren gebuchten Börsen sind Klicks/Bewerbungen/Kosten je Börse laufzeitgewichtet geschätzt (keine separate
          Live-Messung je Börse vorhanden) — gleiche Methode wie in der Anzeige-Detailseite.
        </p>
      )}
    </div>
  );
}
