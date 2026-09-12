// Schritt 3 — Hauptwert-Regel je Kennzahl:
// eigene Zahl > Börsenzahl  -> eigene Zahl, Quelle "eigene Messung"
// Börsenzahl > eigene Zahl  -> Börsenzahl, Quelle "Börse"
// Börse liefert keine Zahl  -> eigene Zahl, Quelle "eigene Messung"
export function resolveMainValue({ own, external }) {
  const hasOwn = own != null;
  const hasExternal = external != null;

  if (!hasOwn && !hasExternal) {
    return { value: null, source: "none" };
  }
  if (hasOwn && !hasExternal) {
    return { value: own, source: "own" };
  }
  if (!hasOwn && hasExternal) {
    return { value: external, source: "external" };
  }
  // both present
  return external > own ? { value: external, source: "external" } : { value: own, source: "own" };
}

export const SOURCE_LABEL = {
  own: "Quelle: eigene Messung",
  external: "Quelle: Börse",
  none: "Keine Daten",
};

export const FUNNEL_STAGES = [
  { key: "impressions", label: "Impressions", sub: "Anzeige wurde ausgespielt", estimable: false, ownOnly: false },
  { key: "clicks", label: "Klicks", sub: "Anzeige vollständig aufgerufen", estimable: false, ownOnly: false },
  { key: "hits", label: "Hits", sub: "≥ 3 Sek. angesehen", estimable: true, ownOnly: true },
  { key: "interactions", label: "Interaktionen", sub: "z. B. gescrollt, weitergeklickt", estimable: true, ownOnly: false },
  { key: "applicationClicks", label: "Gestartete Bewerbungen", sub: "„Jetzt bewerben“ geklickt", estimable: false, ownOnly: false },
];

// Baut die Anzeige-Werte je Stufe inkl. Hauptwert-Regel, Aufschlüsselung und
// Schätzungs-Kennzeichnung (Hits/Interaktionen dürfen laut Vorgabe geschätzt
// werden, Impressions/Klicks/Gestartete Bewerbungen nie).
export function buildFunnel(ad) {
  return FUNNEL_STAGES.map((stage) => {
    const raw = ad.kpi[stage.key] || { own: null, external: null };
    const resolved = resolveMainValue(raw);
    const isEstimated = stage.estimable && resolved.value == null && !stage.ownOnly;
    return {
      ...stage,
      own: raw.own,
      external: raw.external,
      value: resolved.value,
      source: resolved.source,
      isMissingCritical: !stage.estimable && resolved.value == null,
    };
  });
}

// Portfolioweiter Funnel: echte Kennzahlen je Stufe über alle Anzeigen
// summiert (Hauptwert-Regel je Anzeige, dann aufaddiert). `coverage` zeigt,
// bei wie vielen Anzeigen für diese Stufe überhaupt ein Wert vorlag.
export function buildPortfolioFunnel(ads) {
  return FUNNEL_STAGES.map((stage) => {
    let value = 0;
    let coverage = 0;
    for (const ad of ads) {
      const raw = ad.kpi[stage.key] || { own: null, external: null };
      const resolved = resolveMainValue(raw);
      if (resolved.value != null) {
        value += resolved.value;
        coverage += 1;
      }
    }
    return { ...stage, value, coverage, totalAds: ads.length };
  });
}

// Illustrative Erweiterung des Funnels über "Gestartete Bewerbungen" hinaus
// (abgeschlossene/qualifizierte Bewerbung, Interview, Einstellung) — für
// diese Stufen liegen keine echten Daten vor. Die Werte sind plausible
// Beispiel-Verhältnisse zur Veranschaulichung des vollständigen
// Candidate-Journey-Konzepts und müssen in der UI klar als Beispieldaten
// gekennzeichnet bleiben.
const ILLUSTRATIVE_FUNNEL_RATIOS = [
  { key: "applicationsCompleted", label: "Abgeschlossene Bewerbungen", sub: "Bewerbung vollständig eingereicht", ratio: 0.72 },
  { key: "applicationsQualified", label: "Qualifizierte Bewerbungen", sub: "Anforderungen erfüllt", ratio: 0.45 },
  { key: "interviews", label: "Interviews", sub: "Gespräch vereinbart", ratio: 0.55 },
  { key: "hires", label: "Einstellungen", sub: "Position besetzt", ratio: 0.35 },
];

export function buildIllustrativeFunnelExtension(startValue) {
  let current = startValue;
  return ILLUSTRATIVE_FUNNEL_RATIOS.map((stage) => {
    current = Math.round(current * stage.ratio);
    return { key: stage.key, label: stage.label, sub: stage.sub, value: current, isExample: true };
  });
}

// Größter relativer Verlust zwischen zwei aufeinanderfolgenden echten
// Funnel-Stufen (nicht die Beispiel-Erweiterung), inkl. Zuordnung zu einer
// der im Konzept vorgesehenen Empfehlungs-Situationen.
export function findBiggestFunnelDropOff(portfolioFunnel) {
  let worst = null;
  for (let i = 0; i < portfolioFunnel.length - 1; i++) {
    const from = portfolioFunnel[i];
    const to = portfolioFunnel[i + 1];
    if (!from.value || to.value == null) continue;
    const dropRatio = 1 - to.value / from.value;
    if (!worst || dropRatio > worst.dropRatio) {
      worst = { fromKey: from.key, toKey: to.key, fromLabel: from.label, toLabel: to.label, dropRatio, fromValue: from.value, toValue: to.value };
    }
  }
  return worst;
}

// Die Cluster-Serie reicht bis zum Ende der gebuchten Laufzeit und enthält für
// noch nicht erreichte Tage einen eingefrorenen Own-Wert samt hochgerechnetem
// Median. Für Anzeige und Passgenauigkeit zählen nur bereits verstrichene Tage.
export function getClusterSeriesToDate(ad) {
  const series = ad.cluster?.series || [];
  const today = Date.now();
  return series.filter((point) => new Date(point.date).getTime() <= today);
}

// Passgenauigkeit: eigener Endwert der Klicks im Verhältnis zum Cluster-Median
// vergleichbarer Anzeigen (echte Daten aus /export/cluster/advertisement/{id}).
export function computePassgenauigkeit(ad) {
  const series = getClusterSeriesToDate(ad);
  if (!series.length) return null;
  const last = series[series.length - 1];
  if (last.own == null || !last.clusterMedian) return null;
  const ratio = last.own / last.clusterMedian;
  let tier;
  if (ratio >= 1.15) tier = "top";
  else if (ratio >= 0.85) tier = "watch";
  else tier = "action";
  // 0.5x median -> 1 star, 1x median -> 3 stars, >=1.5x median -> 5 stars
  const stars = Math.max(1, Math.min(5, Math.round(ratio * 3)));
  return { ratio, tier, stars, ownValue: last.own, clusterMedian: last.clusterMedian };
}

export const PASSGENAUIGKEIT_TIER = {
  top: { label: "Top", description: "Performt deutlich besser als vergleichbare Anzeigen." },
  watch: { label: "Beobachten", description: "Performt im Bereich vergleichbarer Anzeigen." },
  action: { label: "Handlungsbedarf", description: "Performt unter vergleichbaren Anzeigen." },
};

export function formatNumber(n) {
  if (n == null) return "–";
  return n.toLocaleString("de-DE");
}

export function formatCurrency(n) {
  if (n == null) return "–";
  return `${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

// Laufzeit in Tagen wird aus der Produktbezeichnung gelesen (z. B. "(30T)",
// "90T"), da kein separates Enddatum vorliegt. Bei mehreren Produkten zaehlt
// die laengste Laufzeit.
const PRODUCT_DAYS_RE = /(\d+)\s*T\b/;

export function getRuntimeDays(ad) {
  const days = (ad.products || [])
    .map((p) => {
      const match = p.match(PRODUCT_DAYS_RE);
      return match ? Number(match[1]) : null;
    })
    .filter((d) => d != null);
  return days.length ? Math.max(...days) : null;
}

// Geschaltete Stellenbörsen je Anzeige mit ihrer jeweiligen Laufzeit, zur
// Anzeige in Übersichtstabellen (z. B. anstelle der Quellen-Spalte).
export function buildBoardList(ad) {
  return (ad.products || []).map((p) => {
    const match = p.match(PRODUCT_DAYS_RE);
    return { board: resolveBoardName(p), days: match ? Number(match[1]) : null };
  });
}

// Restlaufzeit je Börse: Schaltdatum + gebuchte Laufzeit minus bereits
// verstrichene Tage (Stand heute). Noch nicht gestartete Anzeigen (Schaltdatum
// in der Zukunft) zeigen die volle gebuchte Laufzeit.
export function getRemainingRuntimeDays(publicationStartDate, days) {
  if (days == null || !publicationStartDate) return null;
  const elapsedMs = Date.now() - new Date(publicationStartDate).getTime();
  const elapsedDays = Math.max(0, Math.floor(elapsedMs / 86400000));
  return Math.max(0, days - elapsedDays);
}

export function resolveBoardName(product) {
  if (!product) return "Weitere Kanäle";
  const n = product.toLowerCase();
  if (n.includes("stepstone")) return "stepstone.de";
  if (n.includes("meinestadt")) return "meinestadt.de";
  if (n.includes("lto")) return "LTO.de";
  return "Weitere Kanäle";
}

// Eigene Linienfarben je Börse (nach Börsen-Identität, nicht nach Position),
// bewusst abgesetzt von Navy (Gesamt-Performance) und Gold (Cluster-Median),
// damit dieselbe Börse in allen Diagrammen und Anzeigen dieselbe Farbe hat.
const BOARD_COLOR_MAP = {
  "stepstone.de": "var(--sg-green-600)",
  "meinestadt.de": "var(--sg-red-500)",
  "LTO.de": "#88312D",
};
const FALLBACK_BOARD_COLORS = ["var(--pw-navy-400)", "var(--sg-blue-500)", "var(--sg-gold-900)"];

export function getBoardColor(boardName, index = 0) {
  return BOARD_COLOR_MAP[boardName] || FALLBACK_BOARD_COLORS[index % FALLBACK_BOARD_COLORS.length];
}

// Liefert je Tag leicht unterschiedliche Gewichte je Börse (Summe = 1), statt
// eines fixen Anteils. Ohne das würden Börsen mit ähnlicher Laufzeit exakt
// deckungsgleiche Kurven ergeben (skalierte Kopien derselben Gesamt-Kurve) und
// wären in Liniendiagrammen nicht mehr voneinander zu unterscheiden.
function dailyBoardWeights(baseWeights, dayIndex) {
  const raws = baseWeights.map((base, j) => {
    const phase = (j / baseWeights.length) * Math.PI * 2;
    return Math.max(0.05, base * (1 + 0.5 * Math.sin(dayIndex / 3.5 + phase)));
  });
  const sum = raws.reduce((s, v) => s + v, 0);
  return raws.map((v) => v / sum);
}

// Teilt die Gesamtwerte je Kennzahl anteilig nach Laufzeit auf die gebuchten
// Produkte/Börsen auf. Es liegen keine echten pro-Börse-Messwerte vor, daher
// ist dies eine Schätzung (deutlich als solche gekennzeichnet in der UI) und
// keine tatsächliche Aufschlüsselung der Börsen-Rohdaten.
export function buildBoardBreakdown(ad) {
  const products = ad.products || [];
  if (products.length < 2) return [];

  const days = products.map((p) => {
    const match = p.match(PRODUCT_DAYS_RE);
    return match ? Number(match[1]) : 30;
  });
  const totalDays = days.reduce((sum, d) => sum + d, 0) || products.length;
  const baseWeights = days.map((d) => d / totalDays);
  const funnel = buildFunnel(ad);
  const clusterSeries = getClusterSeriesToDate(ad);
  const dailyClicksOwn = ad.dailyClicksOwn || [];

  // Kumulierte Cluster-Serie: Zuwachs je Tag (nicht der Gesamtwert) wird mit
  // tageweise variierenden Anteilen verteilt und pro Börse aufsummiert, damit
  // die Linien monoton steigend bleiben, aber nicht deckungsgleich verlaufen.
  const runningOwn = products.map(() => 0);
  const boardSeries = products.map(() => []);
  clusterSeries.forEach((point, i) => {
    const prevOwn = i > 0 ? (clusterSeries[i - 1].own ?? 0) : 0;
    const delta = point.own != null ? Math.max(0, point.own - prevOwn) : 0;
    const dayWeights = dailyBoardWeights(baseWeights, i);
    products.forEach((product, j) => {
      runningOwn[j] += Math.round(delta * dayWeights[j]);
      boardSeries[j].push({
        date: point.date,
        own: runningOwn[j],
        clusterMedian: point.clusterMedian != null ? Math.round(point.clusterMedian * baseWeights[j]) : null,
      });
    });
  });

  const boardDailyClicks = products.map(() => []);
  dailyClicksOwn.forEach((point, i) => {
    const dayWeights = dailyBoardWeights(baseWeights, i);
    products.forEach((product, j) => {
      boardDailyClicks[j].push({
        date: point.date,
        value: point.value != null ? Math.round(point.value * dayWeights[j]) : null,
      });
    });
  });

  return products.map((product, i) => {
    const weight = baseWeights[i];
    const stages = funnel.map((stage) => ({
      ...stage,
      value: stage.value != null ? Math.round(stage.value * weight) : null,
    }));
    return {
      product,
      board: resolveBoardName(product),
      days: days[i],
      weight,
      stages,
      series: boardSeries[i],
      dailyClicks: boardDailyClicks[i],
    };
  });
}

export const COST_METRICS = [
  { key: "impressions", label: "TKP (Impressions)", sub: "Gesamtkosten / Impressionen × 1.000", multiplier: 1000 },
  { key: "clicks", label: "Kosten pro Klick", sub: "Gesamtkosten / Klicks" },
  { key: "hits", label: "Kosten pro Hit", sub: "Gesamtkosten / Hits" },
  { key: "interactions", label: "Kosten pro Interaktion", sub: "Gesamtkosten / Interaktionen" },
  { key: "applicationClicks", label: "Kosten pro Bewerbung", sub: "Gesamtkosten / Gestartete Bewerbungen" },
];

// Kein separates Budget-Feld vorhanden — Stellenanzeigen sind Festpreis-
// Buchungen (Gesamtpreis für die gesamte Laufzeit), kein variables
// Werbebudget mit echtem Verbrauchszähler. Als nachvollziehbare Näherung
// gilt: "verbraucht" = Anteil der bereits verstrichenen Laufzeit am
// Gesamtpreis (gleiche Laufzeit-Logik wie getRemainingRuntimeDays/
// buildCostMetrics) — in der UI immer als Schätzung kennzeichnen.
export function computeBudgetConsumption(ad) {
  const totalCost = ad.order?.grossTotal != null ? Number(ad.order.grossTotal) : null;
  const runtimeDays = getRuntimeDays(ad);
  if (totalCost == null || !runtimeDays) return null;

  const remainingDays = getRemainingRuntimeDays(ad.publicationStartDate, runtimeDays) ?? runtimeDays;
  const elapsedDays = Math.min(runtimeDays, Math.max(0, runtimeDays - remainingDays));
  const consumedPercent = elapsedDays / runtimeDays;
  const consumedCost = totalCost * consumedPercent;

  return {
    totalCost,
    runtimeDays,
    remainingDays,
    elapsedDays,
    consumedPercent,
    consumedCost,
    remainingCost: totalCost - consumedCost,
  };
}

// Baut Lifetime- und Daily-Kostenkennzahlen je Metrik. Gesamtkosten stammen
// aus dem Auftrag, die Mengen aus dem Performance-Funnel (Hauptwert-Regel).
// Zusätzlich der hochgerechnete Cluster-Median (gleiches Budget bei
// median-üblicher Klickzahl) je Metrik.
export function buildCostMetrics(ad) {
  const totalCost = ad.order?.grossTotal != null ? Number(ad.order.grossTotal) : null;
  const funnel = buildFunnel(ad);
  const runtimeDays = getRuntimeDays(ad);
  const clusterMedianClicks = ad.cluster?.median;
  const ownClicks = funnel.find((s) => s.key === "clicks")?.value;
  const ratio = clusterMedianClicks && ownClicks ? ownClicks / clusterMedianClicks : null;

  return COST_METRICS.map((metric) => {
    const stage = funnel.find((s) => s.key === metric.key);
    const count = stage?.value ?? null;
    const hasCount = count != null && count > 0;
    const multiplier = metric.multiplier || 1;
    const lifetime = totalCost != null && hasCount ? (totalCost / count) * multiplier : null;
    const daily = lifetime != null && runtimeDays ? lifetime / runtimeDays : null;
    const medianLifetime = lifetime != null && ratio != null ? lifetime * ratio : null;
    const medianDaily = medianLifetime != null && runtimeDays ? medianLifetime / runtimeDays : null;
    return { ...metric, lifetime, daily, medianLifetime, medianDaily, count, runtimeDays };
  });
}

// Mock-Preisliste je Stellenbörsen-Produkt (Listenpreis/UVP sowie der beim
// Kauf als Teil eines Pakets übliche Paketpreis). Es liegen keine echten
// Preislisten-Daten je Börse vor, daher sind dies plausible Demo-Werte,
// gekeyt auf den Produktnamen ohne Laufzeit-Suffix und "LBIH_"-Präfix.
const BOARD_PRICE_LIST = {
  "stepstone.de Pro": { uvp: 890, preisImPaket: 749 },
  "stepstone.de Pro Ultimate": { uvp: 1780, preisImPaket: 1499 },
  "stepstone.de Pro Campus": { uvp: 690, preisImPaket: 579 },
  "stepstone.de Pro XXL": { uvp: 3200, preisImPaket: 2690 },
  "Online Inland diverse": { uvp: 450, preisImPaket: 379 },
  "meinestadt.de Ausbildungsanzeige": { uvp: 590, preisImPaket: 499 },
  "LTO.de TopJOB": { uvp: 790, preisImPaket: 659 },
};
const DEFAULT_BOARD_PRICE = { uvp: 500, preisImPaket: 420 };

function normalizeProductName(product) {
  return product
    .replace(/^LBIH_\s*/, "")
    .replace(/\(?\d+\s*T\)?/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function getProductPricing(product) {
  return BOARD_PRICE_LIST[normalizeProductName(product)] || DEFAULT_BOARD_PRICE;
}

// Tabelle je gebuchter Stellenbörse: Listenpreis (UVP) und Paketpreis laut
// Preisliste, Anteil des UVP an allen UVPs im Paket (in Prozent) sowie der
// anteilige TKP auf Basis des tatsächlich gezahlten Gesamtpreises (gewichtet
// nach diesem UVP-Anteil) und des laufzeitgewichteten Impressions-Anteils
// (siehe buildBoardBreakdown für dieselbe Gewichtungslogik).
export function buildBoardPricing(ad) {
  const products = ad.products || [];
  if (!products.length) return [];

  const totalCost = ad.order?.grossTotal != null ? Number(ad.order.grossTotal) : null;
  const totalImpressions = buildFunnel(ad).find((s) => s.key === "impressions")?.value ?? null;

  const days = products.map((p) => {
    const match = p.match(PRODUCT_DAYS_RE);
    return match ? Number(match[1]) : 30;
  });
  const totalDays = days.reduce((sum, d) => sum + d, 0) || products.length;

  const pricing = products.map((p) => getProductPricing(p));
  const uvpSum = pricing.reduce((sum, p) => sum + p.uvp, 0);

  return products.map((product, i) => {
    const { uvp, preisImPaket } = pricing[i];
    const uvpShare = uvpSum > 0 ? uvp / uvpSum : 1 / products.length;
    const anteilGesamtpreisEuro = totalCost != null ? totalCost * uvpShare : null;
    const dayWeight = days[i] / totalDays;
    const impressions = totalImpressions != null ? totalImpressions * dayWeight : null;
    const tkp = anteilGesamtpreisEuro != null && impressions ? (anteilGesamtpreisEuro / impressions) * 1000 : null;
    return {
      product,
      board: resolveBoardName(product),
      uvp,
      anteilGesamtpreisPercent: uvpShare * 100,
      preisImPaket,
      tkp,
    };
  });
}

export function formatDate(iso) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("de-DE");
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Median der Bewerbungsstart-Quote (Klicks -> gestartete Bewerbungen) über
// alle Anzeigen mit ausreichend Klicks (>=100, sonst zu volatil). Dient als
// Portfolio-Referenzwert für Funnel-Auffälligkeiten (echte Messdaten).
export function computePortfolioMedianConversion(ads) {
  const ratios = ads
    .map((ad) => {
      const funnel = buildFunnel(ad);
      const clicks = funnel.find((s) => s.key === "clicks")?.value;
      const applications = funnel.find((s) => s.key === "applicationClicks")?.value;
      return clicks && clicks >= 100 && applications != null ? applications / clicks : null;
    })
    .filter((v) => v != null);
  return median(ratios);
}

// Aggregierte Tages-Klicks (eigene Messung) über alle Anzeigen hinweg, für
// die Zeitverlauf-Ansicht auf der Übersicht. Reale Tagesdaten je Anzeige,
// nur nach Datum aufsummiert.
export function buildPortfolioDailyClicks(ads) {
  const byDate = new Map();
  for (const ad of ads) {
    for (const point of ad.dailyClicksOwn || []) {
      if (point.value == null) continue;
      const key = point.date.slice(0, 10);
      byDate.set(key, (byDate.get(key) ?? 0) + point.value);
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

// Tages-Klickverlauf für eine einzelne Börse, über alle Anzeigen aggregiert.
// Bei Anzeigen mit nur dieser einen Börse: exakte Tagesdaten. Bei
// Mehrbörsen-Anzeigen: der laufzeitgewichtete Anteil aus buildBoardBreakdown
// (gleiche Schätzmethode wie überall sonst im Produkt).
export function buildPortfolioDailyClicksByBoard(ads, boardName) {
  const byDate = new Map();
  for (const ad of ads) {
    const products = ad.products || [];
    if (products.length <= 1) {
      if (resolveBoardName(products[0]) !== boardName) continue;
      for (const point of ad.dailyClicksOwn || []) {
        if (point.value == null) continue;
        const key = point.date.slice(0, 10);
        byDate.set(key, (byDate.get(key) ?? 0) + point.value);
      }
    } else {
      const breakdown = buildBoardBreakdown(ad);
      const entry = breakdown.find((b) => b.board === boardName);
      if (!entry) continue;
      for (const point of entry.dailyClicks || []) {
        if (point.value == null) continue;
        const key = point.date.slice(0, 10);
        byDate.set(key, (byDate.get(key) ?? 0) + point.value);
      }
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

// Portfolioweite Kennzahlen je gebuchter Stellenbörse. Bei Anzeigen mit genau
// einem gebuchten Produkt sind Klicks/Bewerbungen/Kosten exakt (kein
// Schätzverfahren nötig). Bei Mehrbörsen-Anzeigen wird dieselbe
// laufzeitgewichtete Schätzung wie in der Anzeige-Detailseite verwendet
// (buildBoardBreakdown/buildBoardPricing) — solche Börsen sind über
// `hasEstimatedContribution` gekennzeichnet.
export function buildPortfolioBoardPerformance(ads) {
  const byBoard = new Map();

  const addContribution = (board, { clicks, applications, cost, estimated }) => {
    const entry = byBoard.get(board) || { board, clicks: 0, applications: 0, cost: 0, adCount: 0, hasEstimatedContribution: false };
    entry.clicks += clicks ?? 0;
    entry.applications += applications ?? 0;
    entry.cost += cost ?? 0;
    entry.adCount += 1;
    if (estimated) entry.hasEstimatedContribution = true;
    byBoard.set(board, entry);
  };

  for (const ad of ads) {
    const products = ad.products || [];
    if (products.length <= 1) {
      const board = resolveBoardName(products[0]);
      const funnel = buildFunnel(ad);
      addContribution(board, {
        clicks: funnel.find((s) => s.key === "clicks")?.value,
        applications: funnel.find((s) => s.key === "applicationClicks")?.value,
        cost: ad.order?.grossTotal != null ? Number(ad.order.grossTotal) : null,
        estimated: false,
      });
    } else {
      const breakdown = buildBoardBreakdown(ad);
      const pricing = buildBoardPricing(ad);
      const totalCost = ad.order?.grossTotal != null ? Number(ad.order.grossTotal) : null;
      breakdown.forEach((entry, i) => {
        const percent = pricing[i]?.anteilGesamtpreisPercent;
        addContribution(entry.board, {
          clicks: entry.stages.find((s) => s.key === "clicks")?.value,
          applications: entry.stages.find((s) => s.key === "applicationClicks")?.value,
          cost: percent != null && totalCost != null ? (percent / 100) * totalCost : null,
          estimated: true,
        });
      });
    }
  }

  return [...byBoard.values()]
    .map((entry) => ({
      ...entry,
      conversion: entry.clicks > 0 ? entry.applications / entry.clicks : null,
      cpa: entry.applications > 0 ? entry.cost / entry.applications : null,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

// Vereinfachtes Qualitätssignal (0-100) aus zwei bereits im Produkt
// etablierten, echten Kennzahlen: Anteil Anzeigen mit Passgenauigkeit
// "Top"/"Beobachten" (60%) und Anteil Anzeigen mit Bewerbungsstart-Quote
// im/über dem Portfolio-Median (40%). Deckt bewusst nur die Dimensionen ab,
// für die echte Daten vorliegen — weitere Faktoren aus einem vollständigen
// Empfehlungs-Score (Skill-/Zielgruppenpassung im Detail, regionale Eignung,
// Kosteneffizienz je Börse) folgen erst mit entsprechender Datengrundlage.
export function computeQualityScore(ads) {
  const passResults = ads.map((ad) => computePassgenauigkeit(ad)).filter(Boolean);
  const topShare = passResults.length ? passResults.filter((p) => p.tier !== "action").length / passResults.length : null;

  const medianConversion = computePortfolioMedianConversion(ads);
  const convEligible = ads
    .map((ad) => {
      const funnel = buildFunnel(ad);
      const clicks = funnel.find((s) => s.key === "clicks")?.value;
      const applications = funnel.find((s) => s.key === "applicationClicks")?.value;
      return clicks && clicks >= 100 && applications != null ? applications / clicks : null;
    })
    .filter((v) => v != null);
  const convShare =
    convEligible.length && medianConversion != null ? convEligible.filter((c) => c >= medianConversion * 0.85).length / convEligible.length : null;

  if (topShare == null && convShare == null) return null;
  const weightedTop = topShare ?? convShare;
  const weightedConv = convShare ?? topShare;
  const score = Math.round(100 * (0.6 * weightedTop + 0.4 * weightedConv));

  return { score, topShare, convShare };
}
