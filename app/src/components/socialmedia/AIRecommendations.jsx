import { CircleCheck, Lightbulb } from "lucide-react";
import { campaign } from "@/lib/socialMedia";
import { cn } from "@/lib/utils";

export default function AIRecommendations() {
  return (
    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
      {campaign.recommendations.map((r, i) => (
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-lg border p-3",
            r.type === "positive" ? "border-success/30 bg-success/5" : "border-[var(--sg-blue-500)]/30 bg-[var(--sg-blue-100)]/40"
          )}
          key={i}
        >
          {r.type === "positive" ? (
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
          ) : (
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-[var(--sg-blue-700)]" />
          )}
          <div>
            <p className="text-xs font-semibold text-foreground">{r.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{r.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
