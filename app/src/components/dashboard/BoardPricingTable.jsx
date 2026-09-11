import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/funnel";

export default function BoardPricingTable({ data }) {
  if (!data?.length) {
    return <p className="text-sm text-muted-foreground">Keine Preisdaten verfügbar.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stellenbörse</TableHead>
          <TableHead className="text-right">UVP</TableHead>
          <TableHead className="text-right">Anteil Gesamtpreis</TableHead>
          <TableHead className="text-right">Preis im Paket</TableHead>
          <TableHead className="text-right">Anteiliger TKP (Impressions)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.product}>
            <TableCell>
              <p className="font-medium text-foreground">{row.board}</p>
              <p className="text-xs whitespace-normal text-muted-foreground">{row.product.trim()}</p>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatCurrency(row.uvp)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatCurrency(row.anteilGesamtpreis)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatCurrency(row.preisImPaket)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatCurrency(row.tkp)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
