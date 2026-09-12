import { CalendarRange, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const ZEITRAUM_OPTIONS = [
  { key: "7d", label: "Letzte 7 Tage", days: 7 },
  { key: "30d", label: "Letzte 30 Tage", days: 30 },
  { key: "90d", label: "Letzte 90 Tage", days: 90 },
  { key: "all", label: "Gesamter Zeitraum", days: null },
];

export default function GlobalFilters({ value, onChange }) {
  const current = ZEITRAUM_OPTIONS.find((o) => o.key === value) ?? ZEITRAUM_OPTIONS[ZEITRAUM_OPTIONS.length - 1];

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <CalendarRange className="size-3.5" />
        Zeitraum
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            type="button"
          >
            {current.label}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {ZEITRAUM_OPTIONS.map((option) => (
            <DropdownMenuItem active={option.key === current.key} key={option.key} onSelect={() => onChange(option.key)}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="text-xs text-muted-foreground">bezogen auf das Schaltdatum</span>
    </div>
  );
}
