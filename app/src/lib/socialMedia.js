import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa6";
import socialMediaData from "@/data/social-media.json";

// Farben ausschließlich aus der bestehenden Personalwerk-Palette (index.css),
// keine offiziellen Plattform-Markenfarben — bewusst konsistent zum Rest des
// Dashboards statt einer neuen Farbwelt.
export const PLATFORM_META = {
  instagram: { name: "Instagram", Icon: FaInstagram, color: "var(--sg-terracotta-500)" },
  facebook: { name: "Facebook", Icon: FaFacebook, color: "var(--sg-blue-700)" },
  linkedin: { name: "LinkedIn", Icon: FaLinkedin, color: "var(--pw-navy-400)" },
  tiktok: { name: "TikTok", Icon: FaTiktok, color: "var(--sg-grey-900)" },
  youtube: { name: "YouTube", Icon: FaYoutube, color: "var(--pw-red-500)" },
};

export function formatCompactNumber(value) {
  if (value == null) return "–";
  return value.toLocaleString("de-DE");
}

export function formatPercent(value, digits = 1) {
  if (value == null) return "–";
  return `${value.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;
}

export function formatEuro(value, digits = 2) {
  if (value == null) return "–";
  return `${value.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits })} €`;
}

export function formatDeltaPercent(value) {
  if (value == null) return "–";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

// Bei Kosten-KPIs ist ein Rückgang positiv (invertKpi = true).
export function isDeltaPositive(value, invertKpi = false) {
  if (value == null) return null;
  return invertKpi ? value < 0 : value > 0;
}

export const campaign = socialMediaData.campaign;
export const campaignComparison = socialMediaData.campaignComparison;

// Eigene Registerkarten je Kostenart, da CPC (~0,79 €) neben CPA (~12,46 €)
// sonst in einem gemeinsamen Chart nicht mehr erkennbar wäre.
export const COST_METRIC_DEFS = [
  { key: "cpm", label: "CPM (Impressions)", volumeKey: "impressions", multiplier: 1000 },
  { key: "cpc", label: "CPC (Klicks)", volumeKey: "clicks", multiplier: 1 },
  { key: "cpa", label: "CPA (Bewerbungen)", volumeKey: "applications", multiplier: 1 },
  { key: "cpqa", label: "Cost per Qualified Application", volumeKey: "qualifiedApplications", multiplier: 1 },
];

const QUALIFIED_RATIO =
  (campaign.funnel.find((s) => s.key === "qualified")?.value ?? 0) / (campaign.funnel.find((s) => s.key === "applications")?.value ?? 1);

function getDailyVolume(point, volumeKey) {
  if (volumeKey === "qualifiedApplications") return point.applications * QUALIFIED_RATIO;
  return point[volumeKey];
}

// Tagesreihe (view="daily", Momentanwert) bzw. kumulierte Reihe
// (view="lifetime", geglätteter Verlauf) je Kostenart — analog zur
// Daily-/Lifetime-Logik der Stellenanzeigen-Kostenauswertung.
export function buildCostSeries(view, metricKey) {
  const metricDef = COST_METRIC_DEFS.find((m) => m.key === metricKey);
  const costByDate = new Map(campaign.costEfficiency.dailySeries.map((d) => [d.date, d.cost]));
  let cumulativeCost = 0;
  let cumulativeVolume = 0;

  return campaign.dailySeries.map((point) => {
    const cost = costByDate.get(point.date) ?? 0;
    const volume = getDailyVolume(point, metricDef.volumeKey);
    if (view === "daily") {
      return { date: point.date, own: volume ? (cost / volume) * metricDef.multiplier : null };
    }
    cumulativeCost += cost;
    cumulativeVolume += volume;
    return { date: point.date, own: cumulativeVolume ? (cumulativeCost / cumulativeVolume) * metricDef.multiplier : null };
  });
}
