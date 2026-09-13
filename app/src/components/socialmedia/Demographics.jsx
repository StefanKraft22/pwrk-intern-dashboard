import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { campaign, formatPercent } from "@/lib/socialMedia";

const GENDER_COLORS = {
  female: "var(--sg-terracotta-500)",
  male: "var(--sg-blue-500)",
  diverse: "var(--sg-gold-700)",
};

export default function Demographics() {
  const { gender, topLocations } = campaign.demographics;
  const genderData = [
    { key: "female", label: "Weiblich", value: gender.female },
    { key: "male", label: "Männlich", value: gender.male },
    { key: "diverse", label: "Divers / k. A.", value: gender.diverse },
  ];
  const maxLocation = Math.max(...topLocations.map((l) => l.percent));

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Geschlecht</p>
        <div className="relative">
          <ResponsiveContainer height={160} width="100%">
            <PieChart>
              <Pie cx="50%" cy="50%" data={genderData} dataKey="value" endAngle={-270} innerRadius={48} outerRadius={70} paddingAngle={2} startAngle={90}>
                {genderData.map((d) => (
                  <Cell fill={GENDER_COLORS[d.key]} key={d.key} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-heading text-lg font-semibold text-foreground">{gender.male} %</span>
            <span className="text-[0.65rem] text-muted-foreground">männlich</span>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {genderData.map((d) => (
            <div className="flex items-center justify-between text-xs" key={d.key}>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="inline-block size-2 rounded-full" style={{ background: GENDER_COLORS[d.key] }} />
                {d.label}
              </span>
              <span className="font-mono font-medium text-foreground">{d.value} %</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Top 5 Standorte</p>
        <div className="flex flex-col gap-2.5">
          {topLocations.map((loc, i) => (
            <div className="flex items-center gap-2.5" key={loc.name}>
              <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-foreground">{loc.name}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">{formatPercent(loc.percent)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-[var(--pw-navy-800)]" style={{ width: `${(loc.percent / maxLocation) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
