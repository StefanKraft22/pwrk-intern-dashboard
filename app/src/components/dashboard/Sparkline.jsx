// Leichtgewichtige Sparkline (kein Chart-Framework noetig) — 12-Punkt-Linie,
// letzter Punkt als Endmarker in der Akzentfarbe hervorgehoben.
export default function Sparkline({ data, width = 96, height = 28, color = "var(--pw-navy-800)" }) {
  if (!data || data.length < 2) {
    return <div className="text-[0.65rem] text-muted-foreground">–</div>;
  }
  const values = data.map((d) => d.value ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg aria-hidden="true" height={height} viewBox={`0 0 ${width} ${height}`} width={width}>
      <path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} opacity={0.55} />
      <circle cx={lastX} cy={lastY} fill={color} r={3} stroke="var(--card)" strokeWidth={2} />
    </svg>
  );
}
