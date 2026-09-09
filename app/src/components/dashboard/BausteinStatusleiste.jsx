import { Check, X } from "lucide-react";
import { BAUSTEINE } from "@/data/bausteine";
import { cn } from "@/lib/utils";

export default function BausteinStatusleiste() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" id="bausteine">
      {BAUSTEINE.map((b) => (
        <div
          key={b.key}
          className={cn(
            "flex flex-col gap-2 rounded-xl border p-4",
            b.active ? "border-[var(--sg-blue-500)]/30 bg-[var(--sg-blue-100)]/50" : "border-border bg-muted/40 opacity-80"
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-medium", b.active ? "text-foreground" : "text-muted-foreground")}>{b.label}</span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full",
                b.active ? "bg-success text-white" : "bg-border text-muted-foreground"
              )}
            >
              {b.active ? <Check className="size-3" /> : <X className="size-3" />}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{b.description}</p>
          {b.active ? (
            <p className="text-[0.7rem] text-[var(--sg-blue-700)]">{b.evidence}</p>
          ) : (
            <p className="text-[0.7rem] italic text-muted-foreground">{b.crossSell}</p>
          )}
        </div>
      ))}
    </div>
  );
}
