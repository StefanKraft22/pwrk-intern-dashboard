import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import ads from "@/data/advertisements.json";
import { EfficiencyBadge } from "@/components/dashboard/EfficiencyBadge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildBoardList, computeAdEfficiency, formatDate, formatNumber, getBoardColor, getRemainingRuntimeDays, resolveMainValue } from "@/lib/funnel";
import { cn } from "@/lib/utils";

// Restlaufzeit-Dringlichkeit: 0 Tage (nicht gestartet/kein Bezug) bleibt
// neutral, < 7 Tage rot, ab 7 Tage wieder neutral.
function getRemainingUrgencyClass(days) {
  if (days == null || days === 0) return "";
  if (days < 7) return "text-destructive";
  return "";
}

const STATUS_STYLES = {
  active: "border-success/40 bg-success/10 text-success",
  scheduled: "border-[var(--sg-blue-500)]/40 bg-[var(--sg-blue-100)] text-[var(--sg-blue-700)]",
};

const COLUMNS = [
  { key: "status", label: "Status", getValue: (ad) => ad.statusLabel },
  { key: "date", label: "Schaltdatum", getValue: (ad) => new Date(ad.publicationStartDate).getTime() },
  { key: "title", label: "Stellentitel", getValue: (ad) => ad.title.toLowerCase() },
  { key: "order", label: "Auftragsnr.", getValue: (ad) => Number(ad.order.number) },
  { key: "boards", label: "Geschaltete Stellenbörsen", getValue: (ad) => buildBoardList(ad).map((b) => b.board).join(", ") },
  { key: "runtimes", label: "Laufzeiten je Börse", align: "right", getValue: (ad) => Math.max(0, ...buildBoardList(ad).map((b) => b.days ?? 0)) },
  {
    key: "remaining",
    label: "Restlaufzeit",
    align: "right",
    getValue: (ad) => Math.max(0, ...buildBoardList(ad).map((b) => getRemainingRuntimeDays(ad.publicationStartDate, b.days) ?? 0)),
  },
  { key: "clicks", label: "Klicks", align: "right", getValue: (ad) => resolveMainValue(ad.kpi.clicks).value },
  { key: "appClicks", label: "Gestartete Bewerbungen", align: "right", wrap: true, getValue: (ad) => resolveMainValue(ad.kpi.applicationClicks).value },
  { key: "effizienz", label: "Effizienz", getValue: (ad) => computeAdEfficiency(ad)?.ratio ?? null },
];

export default function Stellenanzeigen() {
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [search, setSearch] = useState("");

  const filteredAds = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ads;
    return ads.filter((ad) => {
      const boards = buildBoardList(ad)
        .map((b) => b.board)
        .join(" ");
      const haystack = [ad.title, ad.city, ad.order?.number, ad.statusLabel, boards].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [search]);

  const sortedAds = useMemo(() => {
    if (!sort.key) return filteredAds;
    const column = COLUMNS.find((c) => c.key === sort.key);
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filteredAds].sort((a, b) => {
      const va = column.getValue(a);
      const vb = column.getValue(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string") return va.localeCompare(vb, "de") * factor;
      return (va - vb) * factor;
    });
  }, [filteredAds, sort]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" };
    });
  };

  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Stellenanzeigen</h1>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{ads.length} laufende / terminierte Anzeigen. Hauptwert je Kennzahl folgt der Quellen-Regel aus Schritt 3.</p>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Stellenanzeigen durchsuchen"
            className="pl-8"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen…"
            value={search}
          />
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              {COLUMNS.map((col, i) => (
                <th
                  className={cn("px-4 py-3 font-medium", col.align === "right" && "text-right", i === COLUMNS.length - 1 && "pr-6")}
                  key={col.key}
                >
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 select-none hover:text-foreground",
                      col.wrap ? "max-w-[5.5rem] whitespace-normal leading-tight" : "whitespace-nowrap",
                      col.align === "right" && "flex-row-reverse text-right"
                    )}
                    onClick={() => toggleSort(col.key)}
                    type="button"
                  >
                    {col.label}
                    {sort.key === col.key ? (
                      sort.direction === "asc" ? (
                        <ArrowUp className="size-3" />
                      ) : (
                        <ArrowDown className="size-3" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 text-muted-foreground/40" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAds.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={COLUMNS.length}>
                  Keine Anzeigen gefunden.
                </td>
              </tr>
            )}
            {sortedAds.map((ad) => {
              const clicks = resolveMainValue(ad.kpi.clicks);
              const appClicks = resolveMainValue(ad.kpi.applicationClicks);
              const boardList = buildBoardList(ad);
              return (
                <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={ad.id}>
                  <td className="px-4 py-3 align-middle">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wider ${STATUS_STYLES[ad.status] || ""}`}>
                      {ad.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle font-mono text-[0.82rem] tabular-nums">{formatDate(ad.publicationStartDate)}</td>
                  <td className="px-4 py-3 align-middle">
                    <Link className="font-medium text-[var(--sg-blue-700)] underline decoration-dotted underline-offset-4" to={`/stellenanzeigen/${ad.id}`}>
                      {ad.title}
                    </Link>
                    {ad.city && <span className="ml-2 text-xs text-muted-foreground">{ad.city}</span>}
                  </td>
                  <td className="px-4 py-3 align-middle font-mono text-[0.82rem] tabular-nums">{ad.order.number}</td>
                  <td className="px-4 py-3 align-middle">
                    {boardList.map((b, i) => (
                      <p className="flex items-center gap-1.5 whitespace-nowrap" key={`${b.board}-${i}`}>
                        <span className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: getBoardColor(b.board, i) }} />
                        {b.board}
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    {boardList.map((b, i) => (
                      <p className="whitespace-nowrap font-mono tabular-nums" key={`${b.board}-${i}`}>
                        {b.days != null ? `${b.days} Tage` : "–"}
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    {boardList.map((b, i) => {
                      const remaining = getRemainingRuntimeDays(ad.publicationStartDate, b.days);
                      return (
                        <p className={cn("whitespace-nowrap font-mono tabular-nums", getRemainingUrgencyClass(remaining))} key={`${b.board}-${i}`}>
                          {remaining != null ? `${remaining} Tage` : "–"}
                        </p>
                      );
                    })}
                  </td>
                  <td className="px-4 py-3 text-right align-middle font-mono tabular-nums">{formatNumber(clicks.value)}</td>
                  <td className="px-4 py-3 text-right align-middle font-mono tabular-nums">{formatNumber(appClicks.value)}</td>
                  <td className="whitespace-nowrap px-4 py-3 pr-6 align-middle">
                    <EfficiencyBadge ad={ad} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
