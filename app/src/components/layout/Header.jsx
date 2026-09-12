import { Bell, ChevronDown, Download, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import customer from "@/data/customer.json";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateAlerts } from "@/lib/alerts";
import { readSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const alerts = generateAlerts();

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const [muted, setMuted] = useState(() => readSetting("notificationsMuted", false));

  useEffect(() => {
    setMuted(readSetting("notificationsMuted", false));
  }, [location.pathname]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-1">
        <Button aria-label="Menü öffnen" className="md:hidden" onClick={onMenuClick} size="icon" variant="ghost">
          <Menu className="size-4.5" strokeWidth={1.75} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-muted" type="button">
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-medium text-foreground">{customer.name}</p>
                <p className="hidden text-xs text-muted-foreground sm:block">Kundennr. {customer.customerNumber}</p>
              </div>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Mandant</DropdownMenuLabel>
            <DropdownMenuItem active>{customer.name}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <p className="px-2.5 py-1.5 text-xs text-muted-foreground">Weitere Mandanten sind noch nicht verknüpft.</p>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Benachrichtigungen" className="relative" size="icon" variant="ghost">
              <Bell className="size-4" strokeWidth={1.75} />
              {!muted && alerts.length > 0 && (
                <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive font-mono text-[0.6rem] font-medium text-white">
                  {alerts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[22rem]">
            <DropdownMenuLabel>
              Benachrichtigungen ({alerts.length}){muted && <span className="ml-1 font-normal normal-case text-muted-foreground/70">· Badge stummgeschaltet</span>}
            </DropdownMenuLabel>
            {alerts.length === 0 ? (
              <p className="px-2.5 py-3 text-sm text-muted-foreground">Keine neuen Benachrichtigungen.</p>
            ) : (
              <div className="max-h-[380px] overflow-y-auto">
                {alerts.map((alert) => (
                  <Link
                    className="block rounded-md px-2.5 py-2 hover:bg-muted"
                    key={alert.id}
                    to={alert.link}
                  >
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <span className={cn("size-1.5 shrink-0 rounded-full", alert.severity === "hoch" ? "bg-destructive" : "bg-warning")} />
                      <span className="text-sm font-medium text-foreground">{alert.title}</span>
                    </div>
                    <p className="line-clamp-2 pl-3 text-xs text-muted-foreground">{alert.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button aria-label="Export" asChild size="icon" variant="ghost">
              <Link to="/reports">
                <Download className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zu den Reports &amp; CSV-Exporten</TooltipContent>
        </Tooltip>

        <div className="ml-1 flex items-center gap-2 text-xs text-muted-foreground sm:ml-3">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          <span className="hidden sm:inline">Daten aktuell</span>
        </div>
      </div>
    </header>
  );
}
