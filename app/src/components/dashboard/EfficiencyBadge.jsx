import { useEffect, useRef, useState } from "react";
import { computeAdEfficiency, EFFICIENCY_TIER } from "@/lib/funnel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SWEEP_DURATION_MS = 900;

// Animiert die Nadel beim Einblenden von 0 % hoch auf den Zielwert, statt
// direkt in Endposition zu erscheinen.
function useSweepPosition(target) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    let raf = requestAnimationFrame(function tick(ts) {
      if (startRef.current == null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / SWEEP_DURATION_MS);
      const eased = 1 - (1 - t) ** 3;
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

// Gauge deckt ratio 0.4x–1.6x des Cluster-Medians ab; darüber/darunter wird
// die Nadel am jeweiligen Rand geklemmt statt aus der Skala zu laufen.
const GAUGE_MIN_RATIO = 0.4;
const GAUGE_MAX_RATIO = 1.6;

// Halbkreis-Skala: 0 % -> Nadel zeigt nach links (180°), 100 % -> nach rechts (0°).
const CENTER_X = 50;
const CENTER_Y = 50;
const ARC_RADIUS = 38;
const ARC_WIDTH = 15;
const NEEDLE_LENGTH = 33;
const NEEDLE_BASE_WIDTH = 5;

// Segmentgrenzen entsprechen exakt den Tier-Schwellen (0.85x / 1.15x), mit
// kleiner Lücke dazwischen wie bei einem echten Tacho.
const TIER_BOUNDARIES = [37.5, 62.5];
const SEGMENT_GAP = 1.6;
const SEGMENTS = [
  { from: 0, to: TIER_BOUNDARIES[0] - SEGMENT_GAP, color: "var(--destructive)" },
  { from: TIER_BOUNDARIES[0] + SEGMENT_GAP, to: TIER_BOUNDARIES[1] - SEGMENT_GAP, color: "var(--warning)" },
  { from: TIER_BOUNDARIES[1] + SEGMENT_GAP, to: 100, color: "var(--success)" },
];

function gaugePosition(ratio) {
  const clamped = Math.max(GAUGE_MIN_RATIO, Math.min(GAUGE_MAX_RATIO, ratio));
  return ((clamped - GAUGE_MIN_RATIO) / (GAUGE_MAX_RATIO - GAUGE_MIN_RATIO)) * 100;
}

function pointOnArc(position, radius) {
  const angleDeg = 180 - 1.8 * position;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(angleRad),
    y: CENTER_Y - radius * Math.sin(angleRad),
  };
}

function TachoGauge({ position, size }) {
  const animatedPosition = useSweepPosition(position);
  const needleTip = pointOnArc(animatedPosition, NEEDLE_LENGTH);
  const needleAngleRad = ((180 - 1.8 * animatedPosition) * Math.PI) / 180;
  const perpX = -Math.sin(needleAngleRad) * NEEDLE_BASE_WIDTH;
  const perpY = -Math.cos(needleAngleRad) * NEEDLE_BASE_WIDTH;
  const needleBase1 = { x: CENTER_X + perpX, y: CENTER_Y + perpY };
  const needleBase2 = { x: CENTER_X - perpX, y: CENTER_Y - perpY };

  return (
    <svg className={cn("shrink-0", size === "sm" ? "w-11" : "w-16")} viewBox="0 0 100 56">
      {SEGMENTS.map((segment) => {
        const start = pointOnArc(segment.from, ARC_RADIUS);
        const end = pointOnArc(segment.to, ARC_RADIUS);
        return (
          <path
            d={`M ${start.x} ${start.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${end.x} ${end.y}`}
            fill="none"
            key={segment.color}
            stroke={segment.color}
            strokeLinecap="round"
            strokeWidth={ARC_WIDTH}
          />
        );
      })}
      <polygon fill="var(--foreground)" points={`${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y} ${needleTip.x},${needleTip.y}`} />
      <circle cx={CENTER_X} cy={CENTER_Y} fill="var(--foreground)" r="5" stroke="var(--card)" strokeWidth="1.5" />
    </svg>
  );
}

export function EfficiencyBadge({ ad, size = "default" }) {
  const result = computeAdEfficiency(ad);

  if (!result) {
    return <span className="text-xs text-muted-foreground">Effizienz: nicht verfügbar</span>;
  }

  const tier = EFFICIENCY_TIER[result.tier];
  const pct = Math.round(result.ratio * 100);
  const position = gaugePosition(result.ratio);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("inline-flex items-center gap-1.5", size === "sm" && "gap-1")}>
          <TachoGauge position={position} size={size} />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">{size === "sm" ? pct : `${pct} Effizienz`}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">
        <p className="font-medium">
          {tier.label} · {pct} % des Cluster-Medians
        </p>
        <p className="mt-1 text-muted-foreground">{tier.description}</p>
        <p className="mt-1 text-muted-foreground">
          Eigene Klicks: {result.ownValue.toLocaleString("de-DE")} · Cluster-Median: {result.clusterMedian.toLocaleString("de-DE")}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
