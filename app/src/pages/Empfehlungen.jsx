import { useMemo, useState } from "react";
import { CATEGORIES, generateRecommendations, PRIORITY_ORDER } from "@/lib/recommendations";
import { useRecommendationStatus } from "@/lib/useRecommendationStatus";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ALL_RECOMMENDATIONS = generateRecommendations();

// null/undefined werden bei allen Sortierungen ans Ende gestellt, statt als
// kleinster Wert vorne zu erscheinen (z. B. Empfehlungen ohne Restlaufzeit-Bezug).
const SORT_OPTIONS = [
  { key: "prioritaet", label: "Priorität", compare: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] },
  {
    key: "restlaufzeit",
    label: "Restlaufzeit",
    compare: (a, b) => {
      if (a.remainingDays == null && b.remainingDays == null) return 0;
      if (a.remainingDays == null) return 1;
      if (b.remainingDays == null) return -1;
      return a.remainingDays - b.remainingDays;
    },
  },
  {
    key: "optimierungsnotwendigkeit",
    label: "Optimierungsnotwendigkeit",
    compare: (a, b) => {
      if (a.efficiencyRatio == null && b.efficiencyRatio == null) return 0;
      if (a.efficiencyRatio == null) return 1;
      if (b.efficiencyRatio == null) return -1;
      return a.efficiencyRatio - b.efficiencyRatio;
    },
  },
];

export default function Empfehlungen() {
  const [statusMap, setStatus] = useRecommendationStatus();
  const [categoryFilter, setCategoryFilter] = useState("alle");
  const [sortKey, setSortKey] = useState("prioritaet");

  const openRecs = ALL_RECOMMENDATIONS.filter((r) => statusMap[r.id] !== "done" && statusMap[r.id] !== "dismissed");
  const doneCount = ALL_RECOMMENDATIONS.filter((r) => statusMap[r.id] === "done").length;
  const highPriorityOpen = openRecs.filter((r) => r.priority === "hoch").length;
  const affectedAds = new Set(openRecs.map((r) => r.adId)).size;

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const r of openRecs) counts[r.categoryKey] = (counts[r.categoryKey] ?? 0) + 1;
    return counts;
  }, [openRecs]);

  const visible = useMemo(() => {
    const filtered = ALL_RECOMMENDATIONS.filter((r) => categoryFilter === "alle" || r.categoryKey === categoryFilter);
    const sort = SORT_OPTIONS.find((s) => s.key === sortKey) ?? SORT_OPTIONS[0];
    return [...filtered].sort(sort.compare);
  }, [categoryFilter, sortKey]);

  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Empfehlungen</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Regelbasiert aus echten Kennzahlen abgeleitet — Effizienz, Kosten je Börse, Klick-/Bewerbungsverhältnis. Keine Empfehlungen für Bereiche
        ohne Datengrundlage (z. B. Social Media, Employer Branding).
      </p>

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Offene Empfehlungen</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{openRecs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Davon hohe Priorität</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-destructive">{highPriorityOpen}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Betroffene Anzeigen</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{affectedAds}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Bereits erledigt</p>
          <p className="font-heading text-2xl font-semibold tabular-nums text-success">{doneCount}</p>
        </Card>
      </section>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            categoryFilter === "alle" ? "border-[var(--pw-navy-800)] bg-[var(--pw-navy-800)] text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setCategoryFilter("alle")}
          type="button"
        >
          Alle ({openRecs.length})
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              categoryFilter === key ? "border-[var(--pw-navy-800)] bg-[var(--pw-navy-800)] text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
            key={key}
            onClick={() => setCategoryFilter(key)}
            type="button"
          >
            {cat.label} ({categoryCounts[key] ?? 0})
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Sortieren nach:</span>
        {SORT_OPTIONS.map((option) => (
          <button
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              sortKey === option.key ? "border-[var(--pw-navy-800)] bg-[var(--pw-navy-800)] text-white" : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
            key={option.key}
            onClick={() => setSortKey(option.key)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Keine Empfehlungen in dieser Kategorie.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((r) => (
            <RecommendationCard
              categoryLabel={CATEGORIES[r.categoryKey].label}
              key={r.id}
              onStatusChange={(status) => setStatus(r.id, status)}
              recommendation={r}
              status={statusMap[r.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
