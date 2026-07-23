// Pure SVG chart primitives shared by the Progress page (server) and the
// interactive Sleep tracker (client). No hooks here, so both can import it.

type AreaProps = {
  data: number[];
  color?: string;
  height?: number;
  min?: number;
  max?: number;
  showDot?: boolean;
  id: string;
};

// Smooth-ish area chart with a gradient fill and an emphasised final point.
export function AreaChart({ data, color = "#C8A86E", height = 90, min, max, showDot = true, id }: AreaProps) {
  if (data.length === 0) return null;
  const W = 320;
  const H = height;
  const pad = 10;
  const lo = min ?? Math.min(...data);
  const hi = max ?? Math.max(...data);
  const range = hi - lo || 1;
  const stepX = data.length > 1 ? (W - pad * 2) / (data.length - 1) : 0;

  const pts = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - lo) / range) * (H - pad * 2);
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      {showDot && data.length > 1 && (
        <>
          <circle cx={last[0]} cy={last[1]} r={6} fill={color} opacity={0.25} />
          <circle cx={last[0]} cy={last[1]} r={3.2} fill={color} />
        </>
      )}
    </svg>
  );
}
