import ads from "@/data/advertisements.json";
import {
  buildBoardBreakdown,
  buildBoardPricing,
  buildFunnel,
  buildBoardList,
  computeAdEfficiency,
  computePortfolioMedianConversion,
  getRemainingRuntimeDays,
} from "@/lib/funnel";

export const CATEGORIES = {
  anzeigenoptimierung: { label: "Anzeigenoptimierung" },
  laufzeit: { label: "Laufzeit und Schaltungsstrategie" },
  budget: { label: "Portal- und Budgetoptimierung" },
  funnel: { label: "Candidate Journey und Funnel" },
};

export const PRIORITY_ORDER = { hoch: 0, mittel: 1, hinweis: 2 };
export const PRIORITY_LABEL = { hoch: "Hoch", mittel: "Mittel", hinweis: "Hinweis" };

function pct(ratio) {
  return `${Math.round(ratio * 100)} %`;
}

// Regel A — Effizienz "Handlungsbedarf" + geringe Restlaufzeit.
// Echte Daten: computeAdEfficiency (Cluster-Vergleich), Restlaufzeit je Börse.
function ruleAnzeigenoptimierung(ad) {
  const pass = computeAdEfficiency(ad);
  if (!pass || pass.tier !== "action") return null;

  const boards = buildBoardList(ad);
  const maxRemaining = Math.max(0, ...boards.map((b) => getRemainingRuntimeDays(ad.publicationStartDate, b.days) ?? 0));
  const priority = maxRemaining <= 14 ? "hoch" : "mittel";
  const ownPct = pct(pass.ratio);

  return {
    id: `${ad.id}:anzeigenoptimierung`,
    adId: ad.id,
    adTitle: ad.title,
    priority,
    categoryKey: "anzeigenoptimierung",
    title: "Anzeige optimieren",
    reasoning: `Die Anzeige erreicht ${ownPct} des Cluster-Medians vergleichbarer Anzeigen (${pass.ownValue.toLocaleString("de-DE")} von ${pass.clusterMedian.toLocaleString("de-DE")} Klicks) und liegt damit im Bereich "Handlungsbedarf". Restlaufzeit: ${maxRemaining} Tage.`,
    metrics: [
      { label: "Eigene Klicks", value: pass.ownValue.toLocaleString("de-DE") },
      { label: "Cluster-Median", value: pass.clusterMedian.toLocaleString("de-DE") },
      { label: "Effizienz", value: ownPct },
      { label: "Restlaufzeit", value: `${maxRemaining} Tage` },
    ],
    datenbasis: "Eigene Klicks im Verhältnis zum Cluster-Median vergleichbarer Anzeigen (echte Messdaten).",
    actionLabel: "Anzeige ansehen",
    remainingDays: maxRemaining,
    efficiencyRatio: pass.ratio,
  };
}

// Regel D — Effizienz "Top" kurz vor Laufzeitende: Verlängerung sinnvoll.
function ruleLaufzeitVerlaengern(ad) {
  if (ad.status !== "active") return null;
  const pass = computeAdEfficiency(ad);
  if (!pass || pass.tier !== "top") return null;

  const boards = buildBoardList(ad);
  const maxRemaining = Math.max(0, ...boards.map((b) => getRemainingRuntimeDays(ad.publicationStartDate, b.days) ?? 0));
  if (maxRemaining <= 0 || maxRemaining > 14) return null;

  return {
    id: `${ad.id}:laufzeit`,
    adId: ad.id,
    adTitle: ad.title,
    priority: "mittel",
    categoryKey: "laufzeit",
    title: "Laufzeit verlängern",
    reasoning: `Die Anzeige performt mit ${pct(pass.ratio)} des Cluster-Medians deutlich überdurchschnittlich, endet aber in nur noch ${maxRemaining} Tagen. Eine Verlängerung sichert die starke Performance.`,
    metrics: [
      { label: "Effizienz", value: pct(pass.ratio) },
      { label: "Restlaufzeit", value: `${maxRemaining} Tage` },
    ],
    datenbasis: "Eigene Klicks im Verhältnis zum Cluster-Median vergleichbarer Anzeigen (echte Messdaten).",
    actionLabel: "Anzeige ansehen",
    remainingDays: maxRemaining,
    efficiencyRatio: pass.ratio,
  };
}

// Regel B — Kosten je Bewerbung unterscheiden sich zwischen den gebuchten
// Börsen derselben Anzeige. Nutzt dieselbe laufzeitgewichtete Schätzmethode
// wie die bestehende Börsen-Aufschlüsselung/Preistabelle (keine separate
// Live-Messung je Börse vorhanden) — deshalb Priorität maximal "mittel".
function ruleBoardBudget(ad) {
  const breakdown = buildBoardBreakdown(ad);
  if (breakdown.length < 2) return null;
  const pricing = buildBoardPricing(ad);

  const boardCpas = breakdown
    .map((entry, i) => {
      const applications = entry.stages.find((s) => s.key === "applicationClicks")?.value;
      const cost = pricing[i]?.anteilGesamtpreisEuro ?? null;
      if (!applications || cost == null) return null;
      return { board: entry.board, cpa: cost / applications, cost, applications };
    })
    .filter(Boolean);

  if (boardCpas.length < 2) return null;

  const cheapest = boardCpas.reduce((a, b) => (a.cpa < b.cpa ? a : b));
  const priciest = boardCpas.reduce((a, b) => (a.cpa > b.cpa ? a : b));
  if (cheapest.board === priciest.board || priciest.cpa < cheapest.cpa * 1.3) return null;

  return {
    id: `${ad.id}:boardbudget`,
    adId: ad.id,
    adTitle: ad.title,
    priority: "mittel",
    categoryKey: "budget",
    title: `Budgetanteil zu ${cheapest.board} erhöhen`,
    reasoning: `Geschätzte Kosten pro Bewerbung: ${cheapest.board} ${cheapest.cpa.toLocaleString("de-DE", { maximumFractionDigits: 0 })} € vs. ${priciest.board} ${priciest.cpa.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €. Bei der nächsten vergleichbaren Schaltung sollte der Budgetanteil zu ${cheapest.board} erhöht werden.`,
    metrics: boardCpas.map((b) => ({ label: b.board, value: `${b.cpa.toLocaleString("de-DE", { maximumFractionDigits: 0 })} € / Bewerbung` })),
    datenbasis:
      "Geschätzte Aufteilung von Kosten und Bewerbungen nach Laufzeitanteil je Börse (dieselbe Methode wie in der Kosten-Aufschlüsselung der Anzeige) — keine separate Live-Messung je Börse vorhanden.",
    actionLabel: "Anzeige ansehen",
  };
}

// Regel C — Klicks vorhanden, aber Bewerbungsstart-Quote deutlich unter dem
// Portfolio-Median vergleichbarer Anzeigen (echte Klick-/Bewerbungsdaten).
function ruleFunnelConversion(ad, portfolioMedianConversion) {
  const funnel = buildFunnel(ad);
  const clicks = funnel.find((s) => s.key === "clicks")?.value;
  const applications = funnel.find((s) => s.key === "applicationClicks")?.value;
  if (!clicks || clicks < 100 || applications == null || portfolioMedianConversion == null) return null;

  const conversion = applications / clicks;
  if (conversion >= portfolioMedianConversion * 0.7) return null;
  const priority = conversion < portfolioMedianConversion * 0.5 ? "hoch" : "mittel";

  return {
    id: `${ad.id}:funnel`,
    adId: ad.id,
    adTitle: ad.title,
    priority,
    categoryKey: "funnel",
    title: "Bewerbungsstart-Quote verbessern",
    reasoning: `${clicks.toLocaleString("de-DE")} Klicks führten zu nur ${applications.toLocaleString("de-DE")} gestarteten Bewerbungen (${pct(conversion)}). Der Median über alle Anzeigen mit ausreichend Klicks liegt bei ${pct(portfolioMedianConversion)}.`,
    metrics: [
      { label: "Klicks", value: clicks.toLocaleString("de-DE") },
      { label: "Gestartete Bewerbungen", value: applications.toLocaleString("de-DE") },
      { label: "Conversion", value: pct(conversion) },
      { label: "Portfolio-Median", value: pct(portfolioMedianConversion) },
    ],
    datenbasis: "Klicks und gestartete Bewerbungen je Anzeige (echte Messdaten, Hauptwert-Regel).",
    actionLabel: "Anzeige ansehen",
  };
}

// Erzeugt alle Empfehlungen ausschließlich regelbasiert aus echten Kennzahlen
// (bzw. denselben laufzeitgewichteten Schätzungen, die im Produkt bereits an
// anderer Stelle offen ausgewiesen werden). Keine Kategorien ohne
// Datengrundlage (Social Media, Programmatic, Employer Branding) — die
// folgen erst, wenn dafür eine reale oder klar als Beispiel gekennzeichnete
// Datenbasis existiert.
export function generateRecommendations() {
  const portfolioMedianConversion = computePortfolioMedianConversion(ads);
  const recs = [];

  for (const ad of ads) {
    const a = ruleAnzeigenoptimierung(ad);
    if (a) recs.push(a);
    const d = ruleLaufzeitVerlaengern(ad);
    if (d) recs.push(d);
    const b = ruleBoardBudget(ad);
    if (b) recs.push(b);
    const c = ruleFunnelConversion(ad, portfolioMedianConversion);
    if (c) recs.push(c);
  }

  return recs.sort((x, y) => PRIORITY_ORDER[x.priority] - PRIORITY_ORDER[y.priority]);
}
