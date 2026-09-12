import { Link } from "react-router-dom";
import ads from "@/data/advertisements.json";
import { Card } from "@/components/ui/card";
import CostDonut from "@/components/dashboard/CostDonut";
import BudgetSimulations from "@/components/dashboard/BudgetSimulations";
import { buildPortfolioBoardPerformance, computeBudgetConsumption, formatCurrency, formatDate } from "@/lib/funnel";
import { cn } from "@/lib/utils";

export default function BudgetKosten() {
  const portfolioBoards = buildPortfolioBoardPerformance(ads);

  const consumption = ads
    .map((ad) => ({ ad, budget: computeBudgetConsumption(ad) }))
    .filter((row) => row.budget != null);

  const totalCost = consumption.reduce((sum, row) => sum + row.budget.totalCost, 0);
  const totalConsumed = consumption.reduce((sum, row) => sum + row.budget.consumedCost, 0);
  const totalRemaining = totalCost - totalConsumed;
  const avgCostPerAd = consumption.length ? totalCost / consumption.length : null;

  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Budget &amp; Kosten</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Portfolioweite Kostensicht über alle {ads.length} Anzeigen, auf Basis der echten Auftragswerte.
      </p>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Gesamtkosten</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(totalCost)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Verbraucht (geschätzt)</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(totalConsumed)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Verbleibend (geschätzt)</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(totalRemaining)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ø Kosten je Anzeige</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(avgCostPerAd)}</p>
        </Card>
      </section>
      <p className="mb-6 text-xs text-muted-foreground">
        Stellenanzeigen sind Festpreis-Buchungen für die gesamte Laufzeit, kein variables Werbebudget mit echtem Verbrauchszähler.
        "Verbraucht"/"Verbleibend" sind daher laufzeitanteilige Schätzungen (Anteil bereits verstrichener Tage am Gesamtpreis), keine
        Ist-Werte.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Kosten je Stellenbörse</h2>
        <Card className="p-5">
          <CostDonut boards={portfolioBoards} />
        </Card>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Simulationen</h2>
        <BudgetSimulations ads={ads} boards={portfolioBoards} />
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-heading text-sm font-medium">Budgetverbrauch je Anzeige</h2>
          <Link className="text-xs text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground" to="/empfehlungen">
            Optimierungsempfehlungen →
          </Link>
        </div>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Stellentitel</th>
                <th className="px-4 py-3 font-medium">Schaltdatum</th>
                <th className="px-4 py-3 text-right font-medium">Gesamtpreis</th>
                <th className="px-4 py-3 font-medium">Laufzeit verbraucht</th>
                <th className="px-4 py-3 text-right font-medium">Verbleibend</th>
              </tr>
            </thead>
            <tbody>
              {consumption
                .sort((a, b) => b.budget.consumedPercent - a.budget.consumedPercent)
                .map(({ ad, budget }) => (
                  <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={ad.id}>
                    <td className="px-4 py-3">
                      <Link className="font-medium text-[var(--sg-blue-700)] underline decoration-dotted underline-offset-4" to={`/stellenanzeigen/${ad.id}`}>
                        {ad.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums">{formatDate(ad.publicationStartDate)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatCurrency(budget.totalCost)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full", budget.consumedPercent >= 1 ? "bg-muted-foreground" : "bg-[var(--pw-navy-800)]")}
                            style={{ width: `${Math.min(100, budget.consumedPercent * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">{Math.round(Math.min(1, budget.consumedPercent) * 100)} %</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatCurrency(budget.remainingCost)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
