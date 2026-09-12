import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Circle, CircleCheck, CircleX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRIORITY_LABEL } from "@/lib/recommendations";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES = {
  hoch: "border-destructive/40 bg-destructive/10 text-destructive",
  mittel: "border-warning/40 bg-warning/10 text-warning",
  hinweis: "border-border bg-muted text-muted-foreground",
};

export default function RecommendationCard({ recommendation: r, categoryLabel, status, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const isDone = status === "done";
  const isDismissed = status === "dismissed";

  return (
    <Card className={cn("p-4", (isDone || isDismissed) && "opacity-60")}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wide", PRIORITY_STYLES[r.priority])}>
          {PRIORITY_LABEL[r.priority]}
        </span>
        <span className="inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-wide text-muted-foreground">
          {categoryLabel}
        </span>
        {isDone && (
          <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-success">
            <CircleCheck className="size-3" /> Erledigt
          </span>
        )}
        {isDismissed && (
          <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-muted-foreground">
            <CircleX className="size-3" /> Abgelehnt
          </span>
        )}
      </div>

      <h3 className="mb-1 font-heading text-sm font-medium text-foreground">{r.title}</h3>
      <Link className="mb-2 inline-block text-xs text-[var(--sg-blue-700)] underline decoration-dotted underline-offset-4" to={`/stellenanzeigen/${r.adId}`}>
        {r.adTitle}
      </Link>
      <p className="mb-3 text-sm text-muted-foreground">{r.reasoning}</p>

      <button
        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--sg-blue-700)] hover:underline"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        Warum wird mir das empfohlen?
        <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="mb-3 rounded-lg border border-border bg-muted/40 p-3 text-xs">
          <dl className="mb-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
            {r.metrics.map((m) => (
              <div key={m.label}>
                <dt className="text-muted-foreground">{m.label}</dt>
                <dd className="font-mono font-medium text-foreground tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Datenbasis: </span>
            {r.datenbasis}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link to={`/stellenanzeigen/${r.adId}`}>{r.actionLabel}</Link>
        </Button>
        <Button
          onClick={() => onStatusChange(isDone ? null : "done")}
          size="sm"
          variant={isDone ? "secondary" : "ghost"}
        >
          <CircleCheck className="size-3.5" />
          {isDone ? "Als offen markieren" : "Als erledigt markieren"}
        </Button>
        {!isDone && (
          <Button onClick={() => onStatusChange(isDismissed ? null : "dismissed")} size="sm" variant="ghost">
            {isDismissed ? <Circle className="size-3.5" /> : <CircleX className="size-3.5" />}
            {isDismissed ? "Wieder aufnehmen" : "Ablehnen"}
          </Button>
        )}
      </div>
    </Card>
  );
}
