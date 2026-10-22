export default function ArcReactor({ size = 120 }: { size?: number }) {
  const segments = Array.from({ length: 10 });
  const ticks = Array.from({ length: 40 });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="reactor-core select-none"
      aria-hidden
    >
      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#aef4ff" />
          <stop offset="70%" stopColor="#3ee6ff" />
          <stop offset="100%" stopColor="rgba(62,230,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(62,230,255,0.25)" strokeWidth="1" />
      <g className="reactor-ring">
        {ticks.map((_, i) => (
          <rect
            key={i}
            x="59"
            y="4"
            width="2"
            height={i % 5 === 0 ? 8 : 4}
            fill={i % 5 === 0 ? "#3ee6ff" : "rgba(62,230,255,0.45)"}
            transform={`rotate(${i * 9} 60 60)`}
          />
        ))}
      </g>
      <g className="reactor-ring-rev">
        <circle
          cx="60" cy="60" r="42" fill="none"
          stroke="#3ee6ff" strokeWidth="3"
          strokeDasharray="30 14" opacity="0.8"
        />
      </g>
      <g className="reactor-ring-fast">
        {segments.map((_, i) => (
          <path
            key={i}
            d="M 60 27 L 66 36 L 54 36 Z"
            fill="rgba(174,244,255,0.9)"
            transform={`rotate(${i * 36} 60 60)`}
          />
        ))}
        <circle cx="60" cy="60" r="27" fill="none" stroke="rgba(62,230,255,0.7)" strokeWidth="1.5" />
      </g>
      <circle cx="60" cy="60" r="20" fill="url(#coreGrad)" />
      <circle cx="60" cy="60" r="12" fill="#eafcff" opacity="0.95" />
    </svg>
  );
}