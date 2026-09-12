import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatNumber, getRuntimeDays } from "@/lib/funnel";

const SELECT_CLASS =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function BoardShiftSimulation({ boards }) {
  const eligible = boards.filter((b) => b.cpa != null && b.cpa > 0);
  const [fromBoard, setFromBoard] = useState(eligible[0]?.board ?? "");
  const [toBoard, setToBoard] = useState(eligible[1]?.board ?? eligible[0]?.board ?? "");
  const [amount, setAmount] = useState("1000");

  const result = useMemo(() => {
    const from = eligible.find((b) => b.board === fromBoard);
    const to = eligible.find((b) => b.board === toBoard);
    const value = Number(amount);
    if (!from || !to || from === to || !Number.isFinite(value) || value <= 0) return null;
    const lost = value / from.cpa;
    const gained = value / to.cpa;
    return { from, to, lost, gained, net: gained - lost };
  }, [eligible, fromBoard, toBoard, amount]);

  return (
    <Card className="p-5">
      <h3 className="mb-1 font-heading text-sm font-medium text-foreground">Budget zwischen Börsen verschieben</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Annahme: Der aktuelle CPA je Börse (Kosten pro Bewerbung) bleibt bei einer Verschiebung konstant — abnehmende Grenzerträge bei
        höherem Budget sind nicht berücksichtigt.
      </p>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Von Börse
          <select className={SELECT_CLASS} onChange={(e) => setFromBoard(e.target.value)} value={fromBoard}>
            {eligible.map((b) => (
              <option key={b.board} value={b.board}>
                {b.board} (CPA {formatCurrency(b.cpa)})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Zu Börse
          <select className={SELECT_CLASS} onChange={(e) => setToBoard(e.target.value)} value={toBoard}>
            {eligible.map((b) => (
              <option key={b.board} value={b.board}>
                {b.board} (CPA {formatCurrency(b.cpa)})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Betrag
          <Input className="h-8 w-32" inputMode="numeric" onChange={(e) => setAmount(e.target.value)} value={amount} />
        </label>
      </div>

      {!result ? (
        <p className="text-sm text-muted-foreground">Bitte zwei unterschiedliche Börsen und einen Betrag &gt; 0 wählen.</p>
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <p className="text-muted-foreground">
            {formatCurrency(Number(amount))} von <span className="font-medium text-foreground">{result.from.board}</span> zu{" "}
            <span className="font-medium text-foreground">{result.to.board}</span>:
          </p>
          <p className="mt-1">
            ca. <span className="font-mono font-medium text-destructive">−{formatNumber(Math.round(result.lost))}</span> Bewerbungen bei{" "}
            {result.from.board}, ca. <span className="font-mono font-medium text-success">+{formatNumber(Math.round(result.gained))}</span>{" "}
            Bewerbungen bei {result.to.board}.
          </p>
          <p className="mt-1 font-medium text-foreground">
            Netto-Effekt: {result.net >= 0 ? "+" : ""}
            {formatNumber(Math.round(result.net))} Bewerbungen
          </p>
        </div>
      )}
    </Card>
  );
}

function RuntimeExtensionSimulation({ ads }) {
  const eligible = ads.filter((ad) => ad.status === "active" && ad.order?.grossTotal != null && getRuntimeDays(ad));
  const [adId, setAdId] = useState(eligible[0]?.id ?? "");
  const [days, setDays] = useState("30");

  const result = useMemo(() => {
    const ad = eligible.find((a) => a.id === adId);
    const extraDays = Number(days);
    if (!ad || !Number.isFinite(extraDays) || extraDays <= 0) return null;

    const runtimeDays = getRuntimeDays(ad);
    const totalCost = Number(ad.order.grossTotal);
    const dailyRate = totalCost / runtimeDays;
    const additionalCost = dailyRate * extraDays;

    const recentPoints = (ad.dailyClicksOwn || []).filter((p) => p.value != null).slice(-14);
    const avgDailyClicks = recentPoints.length ? recentPoints.reduce((sum, p) => sum + p.value, 0) / recentPoints.length : null;
    const additionalClicks = avgDailyClicks != null ? avgDailyClicks * extraDays : null;

    return { ad, additionalCost, additionalClicks, avgDailyClicks, recentDays: recentPoints.length };
  }, [eligible, adId, days]);

  return (
    <Card className="p-5">
      <h3 className="mb-1 font-heading text-sm font-medium text-foreground">Laufzeit verlängern</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Kosten: laufzeitanteiliger Tagespreis der Anzeige. Klick-Prognose: Durchschnitt der letzten Tage mit Messdaten (max. 14) — keine
        Berücksichtigung von Saisonalität oder Ermüdungseffekten.
      </p>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-1 min-w-[220px] flex-col gap-1 text-xs text-muted-foreground">
          Anzeige
          <select className={SELECT_CLASS} onChange={(e) => setAdId(e.target.value)} value={adId}>
            {eligible.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Verlängerung (Tage)
          <Input className="h-8 w-28" inputMode="numeric" onChange={(e) => setDays(e.target.value)} value={days} />
        </label>
      </div>

      {!result ? (
        <p className="text-sm text-muted-foreground">Bitte eine Anzeige und eine Anzahl Tage &gt; 0 wählen.</p>
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <p className="text-muted-foreground">
            {result.ad.title} um {days} Tage verlängern:
          </p>
          <p className="mt-1">
            Zusätzliche Kosten: <span className="font-mono font-medium text-foreground">{formatCurrency(result.additionalCost)}</span>
          </p>
          <p className="mt-1">
            Erwartete zusätzliche Klicks:{" "}
            {result.additionalClicks != null ? (
              <span className="font-mono font-medium text-foreground">ca. {formatNumber(Math.round(result.additionalClicks))}</span>
            ) : (
              "keine Tagesdaten verfügbar"
            )}
            {result.avgDailyClicks != null && (
              <span className="text-muted-foreground"> (Ø {result.avgDailyClicks.toFixed(1)} Klicks/Tag, letzte {result.recentDays} Tage)</span>
            )}
          </p>
        </div>
      )}
    </Card>
  );
}

export default function BudgetSimulations({ ads, boards }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <BoardShiftSimulation boards={boards} />
      <RuntimeExtensionSimulation ads={ads} />
    </div>
  );
}
