import { Star } from "lucide-react";
import { computePassgenauigkeit, PASSGENAUIGKEIT_TIER } from "@/lib/funnel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TIER_DOT = {
  top: "bg-success",
  watch: "bg-warning",
  action: "bg-destructive",
};

export function PassgenauigkeitBadge({ ad, size = "default" }) {
  const result = computePassgenauigkeit(ad);

  if (!result) {
    return <span className="text-xs text-muted-foreground">Passgenauigkeit: nicht verfügbar</span>;
  }

  const tier = PASSGENAUIGKEIT_TIER[result.tier];
  const pct = Math.round(result.ratio * 100);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("inline-flex items-center gap-2", size === "sm" && "gap-1.5")}>
          <span className={cn("size-2 shrink-0 rounded-full", TIER_DOT[result.tier])} />
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                className={cn(
                  size === "sm" ? "size-3" : "size-3.5",
                  i < result.stars ? "fill-[var(--sg-gold-700)] text-[var(--sg-gold-700)]" : "fill-none text-border"
                )}
                key={i}
              />
            ))}
          </div>
          {size !== "sm" && <span className="font-mono text-xs tabular-nums text-muted-foreground">{pct} % vs. Cluster</span>}
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
