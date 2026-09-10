import { ArrowRight, ClipboardCheck, Info } from "lucide-react";
import { useState } from "react";
import SourceBadge from "./SourceBadge";
import { buildFunnel, formatNumber } from "@/lib/funnel";
import { useApplicationsInput } from "@/lib/useApplicationsInput";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DISCREPANCY_EXPLANATION =
  "Abweichungen entstehen durch unterschiedliche Messmethoden. Die Differenz sind die mobilen Klicks und die über die Börsen eingekauften Reichweiten (SEM, Display), die direkt in den Apps stattfinden und nicht über unser Pixel erfasst werden können.";

function StageTile({ stage }) {
  return (
    <div className="flex min-w-[152px] flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="Erläuterung zur Messmethode" className="text-muted-foreground/60 hover:text-foreground" type="button">
              <Info className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{DISCREPANCY_EXPLANATION}</TooltipContent>
        </Tooltip>
      </div>

      <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">
        {stage.isMissingCritical ? (
          <span className="text-sm font-normal text-muted-foreground">Es liegen keine Daten vor. Eine Schätzung wäre zu ungenau.</span>
        ) : (
          formatNumber(stage.value)
        )}
      </div>

      {!stage.isMissingCritical && <SourceBadge source={stage.source} />}

      <p className="text-[0.72rem] leading-snug text-muted-foreground">{stage.sub}</p>
    </div>
  );
}

function ApplicationsInputTile({ adId, applicationClicksValue }) {
  const [value, setValue] = useApplicationsInput(adId);
  const [draft, setDraft] = useState(value ?? "");

  const numericValue = value != null ? Number(value) : null;
  const showHint = numericValue != null && applicationClicksValue != null && numericValue > applicationClicksValue;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === "") {
      setValue(null);
      return;
    }
    const n = Number(trimmed);
    if (!Number.isNaN(n) && n >= 0) setValue(String(Math.round(n)));
  };

  return (
    <div className="flex min-w-[180px] flex-1 flex-col gap-2 rounded-xl border-2 border-dashed border-[var(--sg-gold-700)]/50 bg-[var(--sg-gold-100)]/40 p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--sg-gold-900)]">
        <ClipboardCheck className="size-3.5" />
        Eingegangene Bewerbungen
      </div>
      <span className="w-fit rounded-full border border-[var(--sg-gold-700)]/40 bg-[var(--sg-gold-200)]/60 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-[var(--sg-gold-900)]">
        Außerhalb des Tracking-Bereichs
      </span>
      <Input
        aria-label="Eingegangene Bewerbungen eintragen"
        className="h-9 bg-card font-mono tabular-nums"
        inputMode="numeric"
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        placeholder="Wert eintragen"
        value={draft}
      />
      {showHint && (
        <p className="rounded-md bg-[var(--sg-gold-200)]/60 p-2 text-[0.7rem] leading-snug text-[var(--sg-gold-900)]">
          Ihr Wert ist höher als die getrackten Klicks. Das ist möglich, bitte prüfen Sie, ob Klicks aus anderen Quellen einfließen.
        </p>
      )}
      <p className="text-[0.72rem] leading-snug text-muted-foreground">
        Aus Ihrem eigenen System — manuell oder automatisch aus dem PPG Recruiting (BMS).{" "}
        <a className="underline decoration-dotted underline-offset-2 hover:text-foreground" href="#bausteine">
          Noch kein BMS? Jetzt informieren →
        </a>
      </p>
    </div>
  );
}

export default function FunnelStages({ ad, className }) {
  const stages = buildFunnel(ad);
  const applicationClicksStage = stages.find((s) => s.key === "applicationClicks");

  return (
    <div className={cn("flex flex-wrap items-stretch gap-2", className)}>
      {stages.map((stage, i) => (
        <div className="flex items-stretch gap-2" key={stage.key}>
          <StageTile stage={stage} />
          <div className="flex items-center text-muted-foreground/50">
            <ArrowRight className="size-4" />
          </div>
        </div>
      ))}
      <ApplicationsInputTile adId={ad.id} applicationClicksValue={applicationClicksStage?.value ?? null} />
    </div>
  );
}
