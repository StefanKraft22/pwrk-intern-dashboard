import { Download, FileSpreadsheet } from "lucide-react";
import ads from "@/data/advertisements.json";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csvExport";
import {
  buildBoardList,
  buildPortfolioBoardPerformance,
  computeBudgetConsumption,
  computeAdEfficiency,
  formatDate,
  getRemainingRuntimeDays,
  resolveMainValue,
} from "@/lib/funnel";

function timestamp() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function exportStellenanzeigen() {
  const headers = ["Status", "Schaltdatum", "Stellentitel", "Auftragsnr.", "Klicks", "Gestartete Bewerbungen", "Restlaufzeit (Tage)", "Effizienz"];
  const rows = ads.map((ad) => {
    const boards = buildBoardList(ad);
    const remaining = Math.max(0, ...boards.map((b) => getRemainingRuntimeDays(ad.publicationStartDate, b.days) ?? 0));
    const pass = computeAdEfficiency(ad);
    return [
      ad.statusLabel,
      formatDate(ad.publicationStartDate),
      ad.title,
      ad.order.number,
      resolveMainValue(ad.kpi.clicks).value ?? "",
      resolveMainValue(ad.kpi.applicationClicks).value ?? "",
      remaining,
      pass ? `${Math.round(pass.ratio * 100)}%` : "",
    ];
  });
  downloadCsv(`stellenanzeigen_${timestamp()}.csv`, headers, rows);
}

function exportPortalPerformance() {
  const headers = ["Börse", "Anzeigen", "Klicks", "Bewerbungen", "Conversion", "Kosten (EUR)", "CPA (EUR)"];
  const rows = buildPortfolioBoardPerformance(ads).map((b) => [
    b.board,
    b.adCount,
    b.clicks,
    b.applications,
    b.conversion != null ? `${(b.conversion * 100).toFixed(1)}%` : "",
    b.cost.toFixed(2),
    b.cpa != null ? b.cpa.toFixed(2) : "",
  ]);
  downloadCsv(`portal-performance_${timestamp()}.csv`, headers, rows);
}

function exportBudget() {
  const headers = ["Stellentitel", "Schaltdatum", "Gesamtpreis (EUR)", "Laufzeit verbraucht (%)", "Verbraucht (EUR)", "Verbleibend (EUR)"];
  const rows = ads
    .map((ad) => ({ ad, budget: computeBudgetConsumption(ad) }))
    .filter((row) => row.budget != null)
    .map(({ ad, budget }) => [
      ad.title,
      formatDate(ad.publicationStartDate),
      budget.totalCost.toFixed(2),
      Math.round(Math.min(1, budget.consumedPercent) * 100),
      budget.consumedCost.toFixed(2),
      budget.remainingCost.toFixed(2),
    ]);
  downloadCsv(`budget-kosten_${timestamp()}.csv`, headers, rows);
}

const REPORTS = [
  {
    key: "stellenanzeigen",
    title: "Stellenanzeigen-Übersicht",
    description: `Status, Schaltdatum, Klicks, Bewerbungen, Restlaufzeit und Effizienz aller ${ads.length} Anzeigen.`,
    run: exportStellenanzeigen,
  },
  {
    key: "portal",
    title: "Portal-Performance",
    description: "Klicks, Bewerbungen, Conversion, Kosten und CPA je gebuchter Stellenbörse.",
    run: exportPortalPerformance,
  },
  {
    key: "budget",
    title: "Budgetverbrauch je Anzeige",
    description: "Gesamtpreis, laufzeitanteiliger Verbrauch und verbleibendes Budget je Anzeige.",
    run: exportBudget,
  },
];

export default function Reports() {
  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Reports</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        CSV-Exporte der bestehenden echten Daten aus diesem Dashboard, zur Weiterverarbeitung z. B. in Excel.
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {REPORTS.map((r) => (
          <Card className="flex flex-col gap-3 p-5" key={r.key}>
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileSpreadsheet className="size-4.5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-heading text-sm font-medium text-foreground">{r.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
            </div>
            <Button className="mt-auto w-fit" onClick={r.run} size="sm" variant="outline">
              <Download className="size-3.5" />
              CSV exportieren
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
