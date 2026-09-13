import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { COST_METRICS, formatCurrency } from "@/lib/funnel";

function formatPercent(value) {
  if (value == null) return "–";
  return `${value.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

const HEAD_CLASS = "whitespace-normal py-2.5 align-bottom text-[0.65rem] leading-tight font-semibold uppercase tracking-wide text-muted-foreground";

export default function BoardPricingTable({ data }) {
  if (!data?.length) {
    return <p className="text-sm text-muted-foreground">Keine Preisdaten verfügbar.</p>;
  }

  return (
    <Table className="table-fixed">
      <TableHeader>
        {/* Farblich abgesetzt, damit die Kopfzeile klar vom Tabelleninhalt getrennt bleibt. */}
        <TableRow className="bg-muted/60 hover:bg-muted/60">
          <TableHead className={`${HEAD_CLASS} w-[16%]`}>Stellenbörse</TableHead>
          <TableHead className={`${HEAD_CLASS} w-[10.5%] text-right`}>UVP</TableHead>
          <TableHead className={`${HEAD_CLASS} w-[10.5%] text-center`}>Anteil Budget</TableHead>
          <TableHead className={`${HEAD_CLASS} w-[10.5%] text-right`}>Preis im Paket</TableHead>
          {COST_METRICS.map((metric) => (
            <TableHead className={`${HEAD_CLASS} w-[10.5%] text-right`} key={metric.key}>
              Anteilig: {metric.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.product}>
            <TableCell className="whitespace-normal">
              <p className="font-medium text-foreground">{row.board}</p>
              <p className="text-xs whitespace-normal text-muted-foreground">{row.product.trim()}</p>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatCurrency(row.uvp)}</TableCell>
            <TableCell className="text-center font-mono tabular-nums">{formatPercent(row.anteilGesamtpreisPercent)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatCurrency(row.preisImPaket)}</TableCell>
            {COST_METRICS.map((metric) => (
              <TableCell className="text-right font-mono tabular-nums" key={metric.key}>
                {formatCurrency(row.costs[metric.key])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
