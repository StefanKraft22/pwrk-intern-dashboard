import quotes from "@/data/quotes.json";
import orders from "@/data/orders.json";
import invoices from "@/data/invoices.json";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/funnel";

function Money({ value }) {
  if (value == null) return "–";
  return `${Number(value).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`;
}

function RecordTable({ rows, numberLabel, dateKey = "createdOn", dateLabel = "Datum" }) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">{numberLabel}</th>
            <th className="px-4 py-3 font-medium">Stellentitel</th>
            <th className="px-4 py-3 font-medium">{dateLabel}</th>
            {rows[0]?.status !== undefined && <th className="px-4 py-3 font-medium">Status</th>}
            <th className="px-4 py-3 text-right font-medium">Betrag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={r.number}>
              <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums">{r.number}</td>
              <td className="px-4 py-3">{r.title || "–"}</td>
              <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums">{formatDate(r[dateKey])}</td>
              {r.status !== undefined && <td className="px-4 py-3">{r.status || "–"}</td>}
              <td className="px-4 py-3 text-right font-mono tabular-nums">
                <Money value={r.grossTotal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export default function Auftragsabwicklung() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <h1 className="mb-1 font-heading text-xl font-medium text-foreground">Auftragsabwicklung</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Reale Stichprobe der letzten Vorgänge. Die vollständige Historie (1.589+ Angebote, 1.601 Aufträge/Rechnungen seit 2021) ist im
        Live-System als paginierte, filterbare Liste hinterlegt.
      </p>

      <Tabs defaultValue="angebote">
        <TabsList className="mb-6 inline-flex h-auto w-fit gap-1 rounded-lg border border-border bg-muted p-1">
          <TabsTrigger
            className="rounded-md px-5 py-2 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-active:bg-[var(--pw-navy-800)] data-active:text-white data-active:shadow-sm data-active:hover:text-white"
            value="angebote"
          >
            Angebote
          </TabsTrigger>
          <TabsTrigger
            className="rounded-md px-5 py-2 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-active:bg-[var(--pw-navy-800)] data-active:text-white data-active:shadow-sm data-active:hover:text-white"
            value="auftraege"
          >
            Aufträge
          </TabsTrigger>
          <TabsTrigger
            className="rounded-md px-5 py-2 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-active:bg-[var(--pw-navy-800)] data-active:text-white data-active:shadow-sm data-active:hover:text-white"
            value="rechnungen"
          >
            Rechnungen
          </TabsTrigger>
        </TabsList>
        <TabsContent value="angebote">
          <RecordTable numberLabel="Angebotsnr." rows={quotes} />
        </TabsContent>
        <TabsContent value="auftraege">
          <RecordTable numberLabel="Auftragsnr." rows={orders} />
        </TabsContent>
        <TabsContent value="rechnungen">
          <RecordTable dateKey="invoiceDate" dateLabel="Rechnungsdatum" numberLabel="Auftragsnr." rows={invoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
