import { FUNNEL_STAGES } from "@/lib/funnel";
import { cn } from "@/lib/utils";

export default function MetricTabs({ value, onChange, options = FUNNEL_STAGES }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            value === option.key
              ? "border-[var(--pw-navy-800)] bg-[var(--pw-navy-800)] text-white"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
          key={option.key}
          onClick={() => onChange(option.key)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
