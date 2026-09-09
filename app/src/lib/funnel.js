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
  { key: "applicationClicks", label: "Bewerbungs-Klicks", sub: "„Jetzt bewerben“ geklickt", estimable: false, ownOnly: false },
];

// Baut die Anzeige-Werte je Stufe inkl. Hauptwert-Regel, Aufschlüsselung und
// Schätzungs-Kennzeichnung (Hits/Interaktionen dürfen laut Vorgabe geschätzt
// werden, Impressions/Klicks/Bewerbungs-Klicks nie).
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

// Passgenauigkeit: eigener Endwert der Klicks im Verhältnis zum Cluster-Median
// vergleichbarer Anzeigen (echte Daten aus /export/cluster/advertisement/{id}).
export function computePassgenauigkeit(ad) {
  const series = ad.cluster?.series || [];
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

export function formatDate(iso) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("de-DE");
}
