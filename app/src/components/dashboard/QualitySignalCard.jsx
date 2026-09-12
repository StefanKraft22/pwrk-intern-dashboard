import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function tierFor(score) {
  if (score >= 75) return { label: "Starker Kanal-Mix", dot: "bg-success" };
  if (score >= 50) return { label: "Solider Kanal-Mix", dot: "bg-warning" };
  return { label: "Optimierungsbedarf im Kanal-Mix", dot: "bg-destructive" };
}

export default function QualitySignalCard({ quality, topBoard, bestConversionBoard }) {
  const [expanded, setExpanded] = useState(false);
  if (!quality) return null;
  const tier = tierFor(quality.score);

  return (
    <Card className="p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", tier.dot)} />
          <p className="font-heading text-lg font-semibold text-foreground">
            {quality.score} <span className="text-sm font-normal text-muted-foreground">von 100 — {tier.label}</span>
          </p>
        </div>
        <Link className="text-xs font-medium text-[var(--sg-blue-700)] hover:underline" to="/empfehlungen">
          Mediaplan optimieren →
        </Link>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        {topBoard && (
          <>
            {topBoard.board} liefert das höchste Klickvolumen
            {bestConversionBoard && bestConversionBoard.board !== topBoard.board && `, ${bestConversionBoard.board} erzielt die beste Conversion`}.{" "}
          </>
        )}
        Basiert auf {Math.round((quality.topShare ?? 0) * 100)} % Anzeigen mit guter bis Top-Passgenauigkeit und{" "}
        {Math.round((quality.convShare ?? 0) * 100)} % Anzeigen mit Bewerbungsstart-Quote im bzw. über dem Portfolio-Median.
      </p>

      <button className="inline-flex items-center gap-1 text-xs font-medium text-[var(--sg-blue-700)] hover:underline" onClick={() => setExpanded((v) => !v)} type="button">
        Score erklären
        <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="mb-1.5">
            <span className="font-medium text-foreground">60 % Passgenauigkeit:</span> Anteil Anzeigen mit Cluster-Vergleich "Top" oder "Beobachten"
            statt "Handlungsbedarf" ({Math.round((quality.topShare ?? 0) * 100)} %).
          </p>
          <p className="mb-1.5">
            <span className="font-medium text-foreground">40 % Conversion:</span> Anteil Anzeigen mit Bewerbungsstart-Quote ≥ 85 % des
            Portfolio-Medians ({Math.round((quality.convShare ?? 0) * 100)} %).
          </p>
          <p>
            Deckt aktuell zwei von mehreren möglichen Faktoren ab. Weitere Dimensionen (z. B. Skill-Passung im Detail, regionale Eignung,
            Kosteneffizienz je Börse) folgen, sobald dafür eine belastbare Datengrundlage vorliegt.
          </p>
        </div>
      )}
    </Card>
  );
}
