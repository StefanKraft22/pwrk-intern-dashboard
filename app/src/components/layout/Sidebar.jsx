import { BookOpen, FileSpreadsheet, FileText, Gauge, LayoutGrid, LifeBuoy, Lightbulb, ListChecks, Route, Scale, Settings, Share2, Wallet, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import ansprechpartnerPhoto from "@/assets/ansprechpartner-marcus-kreuchauff.jpg";

const NAV_GROUPS = [
  {
    items: [
      { to: "/", label: "Übersicht", icon: LayoutGrid, end: true },
      { to: "/empfehlungen", label: "Empfehlungen", icon: Lightbulb },
      { to: "/stellenanzeigen", label: "Stellenanzeigen", icon: FileText },
      { to: "/social-media", label: "Social Media", icon: Share2 },
      { to: "/auftragsabwicklung", label: "Auftragsabwicklung", icon: ListChecks },
      { to: "/statistik", label: "Statistik", icon: Gauge },
    ],
  },
  {
    label: "Analyse",
    items: [
      { to: "/portalvergleich", label: "Portalvergleich", icon: Scale },
      { to: "/candidate-journey", label: "Candidate Journey", icon: Route },
      { to: "/budget-kosten", label: "Budget & Kosten", icon: Wallet },
      { to: "/reports", label: "Reports", icon: FileSpreadsheet },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/hilfe-datenbasis", label: "Hilfe & Datenbasis", icon: BookOpen },
      { to: "/einstellungen", label: "Einstellungen", icon: Settings },
    ],
  },
];

function NavContent({ onNavigate }) {
  return (
    <>
      <nav className="flex flex-col gap-4" aria-label="Hauptnavigation">
        {NAV_GROUPS.map((group, i) => (
          <div className="flex flex-col gap-0.5" key={group.label ?? i}>
            {group.label && (
              <p className="mb-1 px-3 font-mono text-[0.62rem] font-medium uppercase tracking-wider text-white/35">{group.label}</p>
            )}
            {group.items.map((item) => (
              <NavLink
                end={item.end}
                key={item.to}
                onClick={onNavigate}
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
          </div>
        ))}
      </nav>
      <div className="mt-10 flex flex-col gap-2">
        <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
          <img alt="" className="size-11 shrink-0 rounded-full object-cover" src={ansprechpartnerPhoto} />
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium tracking-wide text-white/50 uppercase">Ihr Ansprechpartner</p>
            <p className="truncate text-sm font-medium text-white">Marcus Kreuchauff</p>
            <a className="text-xs text-white/60 underline decoration-dotted underline-offset-2 hover:text-white" href="#">
              Nachricht schreiben
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-xs text-white/60">
          <LifeBuoy className="size-4 shrink-0" strokeWidth={1.75} />
          Hilfe-Center
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto bg-[#03192e] px-3 py-5 text-white md:flex">
        <div className="mb-6 px-2 font-heading text-[1.4625rem] font-medium lowercase">
          personalwerk<span className="text-[#e51747]">.</span>
        </div>
        <NavContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div aria-hidden className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="relative flex h-full w-72 max-w-[80vw] flex-col overflow-y-auto bg-[#03192e] px-3 py-5 text-white">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="font-heading text-[1.4625rem] font-medium lowercase">
                personalwerk<span className="text-[#e51747]">.</span>
              </span>
              <button aria-label="Menü schließen" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white" onClick={onMobileClose} type="button">
                <X className="size-4.5" />
              </button>
            </div>
            <NavContent onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
