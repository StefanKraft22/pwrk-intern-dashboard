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
