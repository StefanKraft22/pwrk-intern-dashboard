// Aktiv/Inaktiv ausschliesslich auf Basis dessen, was auf der Quellseite fuer
// LBIH tatsaechlich nachweisbar war (siehe DATENERFASSUNG.md). Kein Baustein
// wurde als aktiv markiert, ohne dass es einen konkreten Beleg dafuer gibt.
export const BAUSTEINE = [
  {
    key: "multiposting",
    label: "Multiposting",
    description: "Stellenanzeigen-Schaltung über Jobbörsen",
    active: true,
    evidence: "19 laufende/terminierte Anzeigen, 1.601 historische Aufträge über StepStone, LTO.de, meinestadt.de",
  },
  {
    key: "jobboard",
    label: "Karriereseite / JobBoard",
    description: "Eigene Karriereseite mit zentralem Stellenmarkt",
    active: false,
    crossSell: "Kennen Sie schon unser JobBoard? Bündeln Sie alle Vakanzen auf einer eigenen Karriereseite.",
  },
  {
    key: "bms",
    label: "Bewerbermanagement (BMS)",
    description: "PPG Recruiting — Bewerbungen zentral verwalten",
    active: false,
    crossSell: "Mit unserem BMS laufen eingehende Bewerbungen automatisch in Ihr Dashboard — ganz ohne manuelle Eingabe.",
  },
  {
    key: "marktdaten",
    label: "Marktdaten",
    description: "Benchmark- und Gehaltsdaten für Ihre Branche",
    active: false,
    crossSell: "Marktdaten zeigen Ihnen, wie wettbewerbsfähig Ihre Konditionen wirklich sind.",
  },
];
