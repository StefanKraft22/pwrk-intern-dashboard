import { FileText, Gauge, LayoutGrid, LifeBuoy, ListChecks } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Startseite", icon: LayoutGrid, end: true },
  { to: "/stellenanzeigen", label: "Stellenanzeigen", icon: FileText },
  { to: "/auftragsabwicklung", label: "Auftragsabwicklung", icon: ListChecks },
  { to: "/statistik", label: "Statistik", icon: Gauge },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-[#03192e] px-3 py-5 text-white md:flex">
      <div className="mb-8 px-2 font-heading text-lg font-medium lowercase">
        personalwerk<span className="text-[#e51747]">.</span>
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="Hauptnavigation">
        {NAV.map((item) => (
          <NavLink
            end={item.end}
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white",
                isActive && "bg-white/10 font-medium text-white"
              )
            }
          >
            <item.icon className="size-4" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-xs text-white/60">
        <LifeBuoy className="size-4 shrink-0" strokeWidth={1.75} />
        Hilfe-Center
      </div>
    </aside>
  );
}
