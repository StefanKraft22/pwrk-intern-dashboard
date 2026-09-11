import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import ads from "@/data/advertisements.json";
import SourceBadge from "@/components/dashboard/SourceBadge";
import { PassgenauigkeitBadge } from "@/components/dashboard/Passgenauigkeit";
import { Card } from "@/components/ui/card";
import { computePassgenauigkeit, formatDate, formatNumber, resolveMainValue, SOURCE_LABEL } from "@/lib/funnel";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  active: "border-success/40 bg-success/10 text-success",
  scheduled: "border-[var(--sg-blue-500)]/40 bg-[var(--sg-blue-100)] text-[var(--sg-blue-700)]",
};

const COLUMNS = [
  { key: "status", label: "Status", getValue: (ad) => ad.statusLabel },
  { key: "date", label: "Schaltdatum", getValue: (ad) => new Date(ad.publicationStartDate).getTime() },
  { key: "title", label: "Stellentitel", getValue: (ad) => ad.title.toLowerCase() },
  { key: "order", label: "Auftragsnr.", getValue: (ad) => Number(ad.order.number) },
  { key: "clicks", label: "Klicks", align: "right", getValue: (ad) => resolveMainValue(ad.kpi.clicks).value },
  { key: "source", label: "Quelle", getValue: (ad) => SOURCE_LABEL[resolveMainValue(ad.kpi.clicks).source] },
  { key: "appClicks", label: "Gestartete Bewerbungen", align: "right", getValue: (ad) => resolveMainValue(ad.kpi.applicationClicks).value },
  { key: "passgenauigkeit", label: "Passgenauigkeit", getValue: (ad) => computePassgenauigkeit(ad)?.ratio ?? null },
];

export default function Stellenanzeigen() {
  const [sort, setSort] = useState({ key: null, direction: "asc" });

  const sortedAds = useMemo(() => {
    if (!sort.key) return ads;
    const column = COLUMNS.find((c) => c.key === sort.key);
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...ads].sort((a, b) => {
      const va = column.getValue(a);
      const vb = column.getValue(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "string") return va.localeCompare(vb, "de") * factor;
      return (va - vb) * factor;
    });
  }, [sort]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: "asc" };
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Stellenanzeigen</h1>
      <p className="mb-6 text-sm text-muted-foreground">{ads.length} laufende / terminierte Anzeigen. Hauptwert je Kennzahl folgt der Quellen-Regel aus Schritt 3.</p>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              {COLUMNS.map((col) => (
                <th className={cn("px-4 py-3 font-medium", col.align === "right" && "text-right")} key={col.key}>
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap select-none hover:text-foreground",
                      col.align === "right" && "flex-row-reverse"
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
            {sortedAds.map((ad) => {
              const clicks = resolveMainValue(ad.kpi.clicks);
              const appClicks = resolveMainValue(ad.kpi.applicationClicks);
              return (
                <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={ad.id}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] font-medium uppercase tracking-wider ${STATUS_STYLES[ad.status] || ""}`}>
                      {ad.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums">{formatDate(ad.publicationStartDate)}</td>
                  <td className="px-4 py-3">
                    <Link className="font-medium text-[var(--sg-blue-700)] underline decoration-dotted underline-offset-4" to={`/stellenanzeigen/${ad.id}`}>
                      {ad.title}
                    </Link>
                    {ad.city && <span className="ml-2 text-xs text-muted-foreground">{ad.city}</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums">{ad.order.number}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(clicks.value)}</td>
                  <td className="px-4 py-3">
                    <SourceBadge source={clicks.source} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatNumber(appClicks.value)}</td>
                  <td className="px-4 py-3">
                    <PassgenauigkeitBadge ad={ad} size="sm" />
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
