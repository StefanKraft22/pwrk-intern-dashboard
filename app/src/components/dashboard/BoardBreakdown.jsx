import { useState } from "react";
import { Building2, ClipboardCheck } from "lucide-react";
import SourceBadge from "./SourceBadge";
import ClusterComparisonChart from "./ClusterComparisonChart";
import DailyClicksChart from "./DailyClicksChart";
import { Input } from "@/components/ui/input";
import { useApplicationsInput } from "@/lib/useApplicationsInput";
import { formatNumber, getBoardColor } from "@/lib/funnel";

function StageTile({ stage }) {
  return (
    <div className="flex min-w-[152px] flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
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

function ReceivedApplicationsTile({ storageKey }) {
  const [value, setValue] = useApplicationsInput(storageKey);
  const [draft, setDraft] = useState(value ?? "");

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
    </div>
  );
}

function BoardBlock({ entry, color, adId, index }) {
  return (
    <div className="rounded-xl border border-border bg-white/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: color }}>
            <Building2 className="size-3.5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{entry.board}</p>
            <p className="text-[0.7rem] text-muted-foreground">{entry.product.trim()}</p>
          </div>
        </div>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-muted-foreground">
          ≈ {Math.round(entry.weight * 100)}% Anteil · geschätzt
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {entry.stages.map((stage) => (
          <StageTile key={stage.key} stage={stage} />
        ))}
        <ReceivedApplicationsTile storageKey={`${adId}::board::${index}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-1 text-xs font-medium text-muted-foreground">Klicks im Vergleich zu ähnlichen Anzeigen — {entry.board}</h3>
          <ClusterComparisonChart ownColor={color} ownLabel={`Eigene Anzeige (${entry.board})`} series={entry.series} />
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3.5" style={{ background: color }} />
              Eigene Anzeige
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--sg-gold-700)]" />
              Median ähnlicher Anzeigen
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-1 text-xs font-medium text-muted-foreground">Tägliche Klicks — {entry.board}</h3>
          <p className="mb-3 text-[0.7rem] leading-snug text-muted-foreground">Nicht kumuliert, geschätzter Anteil an der Gesamt-Performance.</p>
          <DailyClicksChart color={color} data={entry.dailyClicks} />
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
              {entry.board}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3.5 bg-[var(--pw-red-500)]" />
              Trend (Ø 7 Tage)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoardBreakdown({ entries, adId }) {
  if (!entries?.length) return null;
  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => (
        <BoardBlock adId={adId} color={getBoardColor(entry.board, i)} entry={entry} index={i} key={entry.product} />
      ))}
    </div>
  );
}
