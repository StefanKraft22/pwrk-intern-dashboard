import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ads from "@/data/advertisements.json";
import boersenKpis from "@/data/boersen-kpis-table.json";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PortalRankingTable from "@/components/dashboard/PortalRankingTable";
import DailyClicksChart from "@/components/dashboard/DailyClicksChart";
import { buildPortfolioBoardPerformance, buildPortfolioDailyClicksByBoard, formatNumber, resolveBoardName, resolveMainValue } from "@/lib/funnel";
import { cn } from "@/lib/utils";

const BOOKED_MATCHERS = ["stepstone", "meinestadt", "lto"];

function isBookedBoard(name) {
  const n = name.toLowerCase();
  return BOOKED_MATCHERS.some((m) => n.includes(m));
}

function CapabilityBadge({ pwrk, extern }) {
  if (!pwrk && !extern) {
    return <span className="text-xs text-muted-foreground">–</span>;
  }
  return (
    <span className="inline-flex items-center gap-1">
      {pwrk && <span className="rounded-full border border-[var(--sg-blue-500)]/40 bg-[var(--sg-blue-100)] px-1.5 py-0.5 text-[0.62rem] font-medium text-[var(--sg-blue-700)]">Pwrk-Tracker</span>}
      {extern && <span className="rounded-full border border-border bg-muted px-1.5 py-0.5 text-[0.62rem] font-medium text-muted-foreground">Extern</span>}
    </span>
  );
}

export default function Portalvergleich() {
  const portfolioBoards = useMemo(() => buildPortfolioBoardPerformance(ads), []);
  const [selectedBoard, setSelectedBoard] = useState(portfolioBoards[0]?.board ?? null);
  const [search, setSearch] = useState("");

  const selectedDailyClicks = useMemo(
    () => (selectedBoard ? buildPortfolioDailyClicksByBoard(ads, selectedBoard) : []),
    [selectedBoard]
  );

  const contributingAds = useMemo(() => {
    if (!selectedBoard) return [];
    return ads.filter((ad) => (ad.products || []).some((p) => resolveBoardName(p) === selectedBoard));
  }, [selectedBoard]);

  const marketBoards = useMemo(() => {
    const filtered = boersenKpis.filter((b) => !isBookedBoard(b.name));
    const q = search.trim().toLowerCase();
    return q ? filtered.filter((b) => b.name.toLowerCase().includes(q)) : filtered;
  }, [search]);

  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Portalvergleich</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Gebuchte Stellenbörsen mit echten Performance-Kennzahlen, ergänzt um eine Marktübersicht weiterer verfügbarer Stellenbörsen.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 font-heading text-sm font-medium">Gebuchte Stellenbörsen</h2>
        <PortalRankingTable boards={portfolioBoards} onRowClick={setSelectedBoard} selectedBoard={selectedBoard} />
      </section>

      {selectedBoard && (
        <section className="mb-6">
          <h2 className="mb-2 font-heading text-sm font-medium">Detail: {selectedBoard}</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <Card className="p-5">
              <p className="mb-3 text-xs text-muted-foreground">Tägliche Klicks (eigene Messung, bei Mehrbörsen-Anzeigen laufzeitgewichtet geschätzt).</p>
              {selectedDailyClicks.length ? (
                <DailyClicksChart data={selectedDailyClicks} />
              ) : (
                <p className="text-sm text-muted-foreground">Keine Tagesdaten für diese Börse verfügbar.</p>
              )}
            </Card>
            <Card className="overflow-y-auto p-5" style={{ maxHeight: 280 }}>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Anzeigen auf {selectedBoard}</p>
              <ul className="flex flex-col gap-2 text-sm">
                {contributingAds.map((ad) => (
                  <li className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0" key={ad.id}>
                    <span className="truncate text-foreground">{ad.title}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{formatNumber(resolveMainValue(ad.kpi.clicks).value)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      )}

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-sm font-medium">Marktübersicht — weitere Stellenbörsen ({marketBoards.length})</h2>
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-8 w-56 pl-8 text-sm" onChange={(e) => setSearch(e.target.value)} placeholder="Börse suchen…" value={search} />
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Keine Performance-Daten vorhanden, da diese Börsen aktuell nicht gebucht sind. Zeigt nur, welche Kennzahlen über welche Quelle
          grundsätzlich messbar wären, basierend auf der Personalwerk-Datenbasis von 120+ Stellenbörsen.
        </p>
        <Card className="max-h-[480px] overflow-y-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Börse</th>
                <th className="px-4 py-3 font-medium">Klicks</th>
                <th className="px-4 py-3 font-medium">Hits</th>
                <th className="px-4 py-3 font-medium">Interaktionen</th>
                <th className="px-4 py-3 font-medium">Bewerbungsstarts</th>
              </tr>
            </thead>
            <tbody>
              {marketBoards.map((b) => (
                <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={b.name}>
                  <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                  <td className="px-4 py-3"><CapabilityBadge extern={b["Klicks extern"]} pwrk={b["Klicks Pwrk-Tracker"]} /></td>
                  <td className="px-4 py-3"><CapabilityBadge extern={b["Hits extern"]} pwrk={b["Hits Pwrk-Tracker"]} /></td>
                  <td className="px-4 py-3"><CapabilityBadge extern={b["Interactions extern"]} pwrk={b["Interactions Pwrk-Tracker"]} /></td>
                  <td className="px-4 py-3"><CapabilityBadge extern={b["Bewerbungsstarts extern"]} pwrk={b["Bewerbungsstarts Pwrk-Tracker"]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}
