import { ChevronRight, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import SourceBadge from "./SourceBadge";
import { buildFunnel, formatNumber } from "@/lib/funnel";
import { useApplicationsInput } from "@/lib/useApplicationsInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StageTile({ stage }) {
  return (
    <div className="flex min-w-[152px] flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex min-h-8 items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
      </div>

      <div className="min-h-9 font-heading text-2xl font-semibold tabular-nums text-foreground">
        {stage.isMissingCritical ? (
          <span className="text-sm font-normal text-muted-foreground">Es liegen keine Daten vor. Eine Schätzung wäre zu ungenau.</span>
        ) : (
          formatNumber(stage.value)
        )}
      </div>

      <div className="min-h-[18px]">{!stage.isMissingCritical && <SourceBadge source={stage.source} />}</div>

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
    <div className="flex min-w-[180px] flex-1 flex-col gap-2 rounded-xl border-2 border-[var(--sg-gold-700)]/50 bg-[var(--sg-gold-100)]/40 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--sg-gold-900)]">
        <ClipboardCheck className="size-6 shrink-0" strokeWidth={1.75} />
        <span className="leading-tight">Eingegangene Bewerbungen</span>
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
      <p className="mt-1 border-t border-[var(--sg-gold-700)]/25 pt-2.5 text-[0.72rem] leading-snug text-muted-foreground">
        Eingabe manuell oder über Ihr Recruiting System (BMS)
      </p>
      <div className="mt-1 flex flex-col items-start gap-1.5">
        <p className="text-[0.72rem] font-bold leading-snug text-foreground">Noch kein BMS?</p>
        <Button className="w-full bg-[var(--pw-red-500)] text-white hover:bg-[var(--pw-red-700)]" size="sm" type="button">
          Jetzt informieren
        </Button>
      </div>
    </div>
  );
}

export default function FunnelStages({ ad, className }) {
  const stages = buildFunnel(ad);
  const applicationClicksStage = stages.find((s) => s.key === "applicationClicks");

  return (
    <div className={cn("grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3 lg:grid-cols-6", className)}>
      {stages.map((stage) => (
        <div className="flex items-stretch gap-2" key={stage.key}>
          <StageTile stage={stage} />
          <div className="hidden items-center text-muted-foreground/50 lg:flex">
            <ChevronRight className="size-7" strokeWidth={3} />
          </div>
        </div>
      ))}
      <ApplicationsInputTile adId={ad.id} applicationClicksValue={applicationClicksStage?.value ?? null} />
    </div>
  );
}
