import { Card } from "@/components/ui/card";
import { formatDeltaPercent, isDeltaPositive } from "@/lib/socialMedia";
import { cn } from "@/lib/utils";

export default function SocialKpiCard({ label, value, delta, icon: Icon, iconColor = "var(--pw-navy-800)", invert = false }) {
  const positive = isDeltaPositive(delta, invert);

  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: iconColor }}>
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="font-heading text-2xl font-semibold whitespace-nowrap tabular-nums text-foreground">{value}</span>
      <span className={cn("text-xs font-medium", positive ? "text-success" : "text-destructive")}>
        {formatDeltaPercent(delta)} <span className="font-normal text-muted-foreground">vs. Vormonat</span>
      </span>
    </Card>
  );
}
