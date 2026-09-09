import { cn } from "@/lib/utils";

const STYLES = {
  own: "border-[var(--sg-blue-500)]/40 bg-[var(--sg-blue-100)] text-[var(--sg-blue-700)]",
  external: "border-[var(--sg-gold-700)]/40 bg-[var(--sg-gold-100)] text-[var(--sg-gold-900)]",
  none: "border-border bg-muted text-muted-foreground",
};

const LABEL = {
  own: "Quelle: eigene Messung",
  external: "Quelle: Börse",
  none: "keine Daten",
};

export default function SourceBadge({ source, className }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wide",
        STYLES[source] || STYLES.none,
        className
      )}
    >
      {LABEL[source] || LABEL.none}
    </span>
  );
}
