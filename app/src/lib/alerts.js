import ads from "@/data/advertisements.json";
import { generateRecommendations } from "@/lib/recommendations";
import { buildBoardList, computeBudgetConsumption, getRemainingRuntimeDays } from "@/lib/funnel";

export const ALERT_SEVERITY_ORDER = { hoch: 0, mittel: 1 };

// Alle Meldungen basieren auf denselben echten Kennzahlen, die auch auf den
// jeweiligen Fachseiten verwendet werden (Empfehlungs-Engine, Restlaufzeit,
// Budgetverbrauch) — keine eigene, neue Datengrundlage.
export function generateAlerts() {
  const alerts = [];

  for (const r of generateRecommendations().filter((rec) => rec.priority === "hoch")) {
    alerts.push({
      id: `rec:${r.id}`,
      severity: "hoch",
      title: r.title,
      description: `${r.adTitle} — ${r.reasoning}`,
      link: "/empfehlungen",
      linkLabel: "Empfehlung ansehen",
    });
  }

  for (const ad of ads) {
    if (ad.status !== "active") continue;
    const boards = buildBoardList(ad);
    const remaining = Math.max(0, ...boards.map((b) => getRemainingRuntimeDays(ad.publicationStartDate, b.days) ?? 0));
    if (remaining > 0 && remaining <= 7) {
      alerts.push({
        id: `ending:${ad.id}`,
        severity: "mittel",
        title: "Anzeige endet in Kürze",
        description: `${ad.title} — noch ${remaining} ${remaining === 1 ? "Tag" : "Tage"} Restlaufzeit.`,
        link: `/stellenanzeigen/${ad.id}`,
        linkLabel: "Anzeige ansehen",
      });
    }
  }

  for (const ad of ads) {
    if (ad.status !== "active") continue;
    const budget = computeBudgetConsumption(ad);
    if (budget && budget.remainingDays === 0 && budget.consumedPercent >= 1) {
      alerts.push({
        id: `expired:${ad.id}`,
        severity: "hoch",
        title: "Laufzeit abgelaufen, Status weiterhin aktiv",
        description: `${ad.title} — gebuchte Laufzeit ist verstrichen, Status sollte geprüft werden.`,
        link: `/stellenanzeigen/${ad.id}`,
        linkLabel: "Anzeige ansehen",
      });
    }
  }

  return alerts.sort((a, b) => ALERT_SEVERITY_ORDER[a.severity] - ALERT_SEVERITY_ORDER[b.severity]);
}
