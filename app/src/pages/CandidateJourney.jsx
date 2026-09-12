import { ChevronRight, TriangleAlert } from "lucide-react";
import ads from "@/data/advertisements.json";
import { Card } from "@/components/ui/card";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import { useRecommendationStatus } from "@/lib/useRecommendationStatus";
import { CATEGORIES, generateRecommendations } from "@/lib/recommendations";
import { buildPortfolioFunnel, buildIllustrativeFunnelExtension, findBiggestFunnelDropOff, formatNumber } from "@/lib/funnel";
import { cn } from "@/lib/utils";

const DROPOFF_TIPS = {
  "impressions->clicks": {
    title: "Hohe Reichweite, aber geringe Klickrate",
    tips: ["Stellentitel optimieren", "Anzeige prominenter platzieren", "Einstiegstext verbessern", "Benefits klarer darstellen"],
  },
  "clicks->hits": {
    title: "Klicks vorhanden, aber geringe Verweildauer",
    tips: ["Anzeigeninhalt und Layout prüfen", "Mobile Darstellung testen", "Ladezeiten reduzieren"],
  },
  "hits->interactions": {
    title: "Anzeige wird angesehen, aber kaum Interaktion",
    tips: ["Bewerbungsbutton sichtbarer gestalten", "Aufgaben und Benefits klarer strukturieren"],
  },
  "interactions->applicationClicks": {
    title: "Viele Klicks, aber wenige Bewerbungsstarts",
    tips: ["Gehalt oder Benefits ergänzen", "Anforderungen reduzieren oder priorisieren", "Bewerbungsprozess transparenter erklären"],
  },
};

function RealStageTile({ stage, isDropStart, isDropEnd }) {
  return (
    <div
      className={cn(
        "flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-xl border bg-card p-4",
        isDropStart || isDropEnd ? "border-warning/50 bg-warning/5" : "border-border"
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
      <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">{formatNumber(stage.value)}</span>
      <p className="text-[0.7rem] leading-snug text-muted-foreground">{stage.sub}</p>
      {stage.coverage < stage.totalAds && (
        <p className="text-[0.65rem] text-muted-foreground">Daten für {stage.coverage} von {stage.totalAds} Anzeigen</p>
      )}
    </div>
  );
}

function ExampleStageTile({ stage }) {
  return (
    <div className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{stage.label}</span>
        <span className="rounded-full border border-border bg-card px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-wide text-muted-foreground">
          Beispiel
        </span>
      </div>
      <span className="font-heading text-2xl font-semibold tabular-nums text-muted-foreground">{formatNumber(stage.value)}</span>
      <p className="text-[0.7rem] leading-snug text-muted-foreground">{stage.sub}</p>
    </div>
  );
}

export default function CandidateJourney() {
  const [statusMap, setStatus] = useRecommendationStatus();
  const portfolioFunnel = buildPortfolioFunnel(ads);
  const startValue = portfolioFunnel.find((s) => s.key === "applicationClicks")?.value ?? 0;
  const illustrativeStages = buildIllustrativeFunnelExtension(startValue);
  const dropOff = findBiggestFunnelDropOff(portfolioFunnel);
  const dropOffTip = dropOff ? DROPOFF_TIPS[`${dropOff.fromKey}->${dropOff.toKey}`] : null;

  const funnelRecommendations = generateRecommendations().filter((r) => r.categoryKey === "funnel");

  return (
    <div className="w-full px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Candidate Journey</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Der Bewerberlauf von der Impression bis zur Einstellung, aggregiert über alle {ads.length} Anzeigen.
      </p>

      <section className="mb-4">
        <h2 className="mb-2 font-heading text-sm font-medium">Echte Kennzahlen</h2>
        <div className="flex flex-wrap items-stretch gap-2">
          {portfolioFunnel.map((stage, i) => (
            <div className="flex items-stretch gap-2" key={stage.key}>
              <RealStageTile
                isDropEnd={dropOff?.toKey === stage.key}
                isDropStart={dropOff?.fromKey === stage.key}
                stage={stage}
              />
              {i < portfolioFunnel.length - 1 && (
                <div className={cn("flex items-center", dropOff?.fromKey === stage.key ? "text-warning" : "text-muted-foreground/50")}>
                  <ChevronRight className="size-7" strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-heading text-sm font-medium">Erweiterung: bis zur Einstellung</h2>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Für diese Stufen liegt keine Live-Messung vor. Die Werte sind Beispieldaten (plausible Verhältnisse) zur Veranschaulichung des
          vollständigen Bewerberlaufs — keine echten Zahlen.
        </p>
        <div className="flex flex-wrap items-stretch gap-2">
          {illustrativeStages.map((stage, i) => (
            <div className="flex items-stretch gap-2" key={stage.key}>
              <ExampleStageTile stage={stage} />
              {i < illustrativeStages.length - 1 && (
                <div className="flex items-center text-muted-foreground/30">
                  <ChevronRight className="size-7" strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {dropOff && dropOffTip && (
        <section className="mb-6">
          <Card className="border-warning/40 bg-warning/5 p-4">
            <div className="mb-1 flex items-center gap-2">
              <TriangleAlert className="size-4 text-warning" />
              <h2 className="font-heading text-sm font-medium">
                Größter Verlust: {dropOff.fromLabel} → {dropOff.toLabel} (−{Math.round(dropOff.dropRatio * 100)} %)
              </h2>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {formatNumber(dropOff.fromValue)} → {formatNumber(dropOff.toValue)}. Muster: {dropOffTip.title}.
            </p>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {dropOffTip.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-heading text-sm font-medium">Empfehlungen entlang des Funnels</h2>
        {funnelRecommendations.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">Aktuell keine funnelbezogenen Empfehlungen.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {funnelRecommendations.map((r) => (
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
      </section>
    </div>
  );
}
