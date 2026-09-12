import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getBoardColor, formatCurrency } from "@/lib/funnel";

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { board, cost } = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{board}</p>
      <p className="font-mono tabular-nums text-muted-foreground">{formatCurrency(cost)}</p>
    </div>
  );
}

export default function CostDonut({ boards }) {
  const data = boards.filter((b) => b.cost > 0);
  const total = data.reduce((sum, b) => sum + b.cost, 0);
  if (!data.length) return <p className="text-sm text-muted-foreground">Keine Kostendaten verfügbar.</p>;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie cx="50%" cy="50%" data={data} dataKey="cost" innerRadius={54} nameKey="board" outerRadius={80} paddingAngle={2} strokeWidth={0}>
              {data.map((b, i) => (
                <Cell fill={getBoardColor(b.board, i)} key={b.board} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-lg font-semibold text-foreground">{formatCurrency(total)}</span>
          <span className="text-[0.65rem] text-muted-foreground">Gesamt</span>
        </div>
      </div>
      <ul className="flex flex-1 flex-col gap-1.5 text-sm">
        {data.map((b, i) => (
          <li className="flex items-center justify-between gap-3" key={b.board}>
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: getBoardColor(b.board, i) }} />
              {b.board}
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {formatCurrency(b.cost)} · {total > 0 ? Math.round((b.cost / total) * 100) : 0} %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
