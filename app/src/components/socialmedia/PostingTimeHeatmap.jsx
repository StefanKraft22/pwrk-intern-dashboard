import { campaign } from "@/lib/socialMedia";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

export default function PostingTimeHeatmap() {
  const data = campaign.postingHeatmap;
  const max = Math.max(...data.map((d) => d.value));
  const lookup = new Map(data.map((d) => [`${d.day}-${d.hour}`, d.value]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-12" />
            {DAYS.map((day) => (
              <th className="pb-1 text-center font-medium text-muted-foreground" key={day}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) => (
            <tr key={hour}>
              <td className="pr-2 text-right font-mono text-[0.68rem] whitespace-nowrap text-muted-foreground">{String(hour).padStart(2, "0")}:00</td>
              {DAYS.map((day) => {
                const value = lookup.get(`${day}-${hour}`) ?? 0;
                const intensity = max ? value / max : 0;
                return (
                  <td
                    className="h-7 rounded"
                    key={day}
                    style={{ background: `color-mix(in oklab, var(--pw-navy-800) ${Math.round(intensity * 90)}%, var(--muted))` }}
                    title={`${day} ${hour}:00 Uhr – ${value}`}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center gap-2 text-[0.68rem] text-muted-foreground">
        <span>Wenig</span>
        <div className="flex h-2 flex-1 max-w-32 overflow-hidden rounded-full">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ background: `color-mix(in oklab, var(--pw-navy-800) ${(i + 1) * 9}%, var(--muted))`, flex: 1 }} />
          ))}
        </div>
        <span>Viel Engagement</span>
      </div>
    </div>
  );
}
