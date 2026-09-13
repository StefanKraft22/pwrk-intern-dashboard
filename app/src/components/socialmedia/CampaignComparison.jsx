import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/funnel";
import { campaignComparison, formatEuro, formatPercent } from "@/lib/socialMedia";

export default function CampaignComparison() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kampagne</TableHead>
          <TableHead className="text-right">Reichweite</TableHead>
          <TableHead className="text-right">Engagement</TableHead>
          <TableHead className="text-right">Klicks</TableHead>
          <TableHead className="text-right">Bewerbungen</TableHead>
          <TableHead className="text-right">Budget</TableHead>
          <TableHead className="text-right">CPA</TableHead>
          <TableHead className="text-right">CTR</TableHead>
          <TableHead className="text-right">Conversion Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaignComparison.map((c) => (
          <TableRow key={c.name}>
            <TableCell className="font-medium text-foreground">{c.name}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(c.reach)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(c.engagement)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(c.clicks)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(c.applications)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatEuro(c.budget, 0)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatEuro(c.cpa)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatPercent(c.ctr)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatPercent(c.conversionRate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
