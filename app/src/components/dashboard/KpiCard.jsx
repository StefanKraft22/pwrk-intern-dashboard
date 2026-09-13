import { Card } from "@/components/ui/card";
import Sparkline from "./Sparkline";
import { cn } from "@/lib/utils";

export default function KpiCard({ label, value, suffix, delta, sparklineData, className }) {
  return (
    <Card className={cn("flex min-w-0 flex-col gap-2 p-4", className)}>
      <span className="block truncate text-[0.68rem] font-medium text-muted-foreground" title={label}>
        {label}
      </span>
      <div className="flex items-end justify-between gap-3">
        <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
          {value}
          {suffix && <span className="ml-0.5 text-base font-normal text-muted-foreground">{suffix}</span>}
        </span>
        {sparklineData && <Sparkline data={sparklineData} />}
      </div>
      {delta && <span className={cn("text-xs font-medium", delta.positive ? "text-success" : "text-destructive")}>{delta.label}</span>}
    </Card>
  );
}
