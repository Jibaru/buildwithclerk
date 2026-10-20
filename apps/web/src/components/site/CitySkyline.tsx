import { registry } from '@buildwithclerk/registry'

/**
 * Static stand-in for the live Phaser hero that lands in M3. Draws the registry's buildings as
 * a night skyline so the hero already changes when the catalog does. Pure SVG, no JS.
 */
export function CitySkyline({ className }: { className?: string }) {
  const buildings = registry
    .map((p) => ({
      x: p.city.position.x,
      h: 6 + ((p.number * 7) % 9),
      lit: p.status !== 'planned',
      slug: p.slug,
    }))
    .sort((a, b) => a.x - b.x)
  const unit = 16
  const width = 64 * unit
  const ground = 28 * unit
  const lampXs = Array.from({ length: 11 }, (_, i) => i * 96 + 38)
  return (
    <svg
      viewBox={`0 0 ${width} ${ground + unit * 2}`}
      className={className}
      preserveAspectRatio="xMidYMax slice"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor="#6c47ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6c47ff" stopOpacity="0" />
        </radialGradient>
        <pattern id="stars" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect x="7" y="9" width="1.5" height="1.5" fill="#d9d9de" opacity="0.6" />
          <rect x="31" y="22" width="1.5" height="1.5" fill="#d9d9de" opacity="0.4" />
          <rect x="20" y="38" width="1.5" height="1.5" fill="#d9d9de" opacity="0.5" />
        </pattern>
      </defs>
      <rect width={width} height={ground + unit * 2} fill="#131316" />
      <rect width={width} height={ground} fill="url(#stars)" />
      <rect width={width} height={ground + unit * 2} fill="url(#glow)" />
      {buildings.map((b) => {
        const bx = b.x * unit
        const bw = unit * 3
        const by = ground - b.h * unit
        const windows: React.ReactNode[] = []
        for (let row = 0; row < b.h - 1; row++) {
          for (let col = 0; col < 2; col++) {
            const on = b.lit ? (row + col + b.x) % 3 !== 0 : (row * 5 + col + b.x) % 7 === 0
            windows.push(
              <rect
                key={`${b.slug}-${row}-${col}`}
                x={bx + 8 + col * 20}
                y={by + 8 + row * unit}
                width="6"
                height="6"
                fill={on ? (b.lit ? '#6c47ff' : '#9394a1') : '#27272d'}
                opacity={on ? 0.95 : 1}
              />,
            )
          }
        }
        return (
          <g key={b.slug}>
            <rect x={bx} y={by} width={bw} height={b.h * unit} fill="#212126" />
            <rect x={bx} y={by} width={bw} height="3" fill={b.lit ? '#00aee3' : '#42434d'} />
            {windows}
          </g>
        )
      })}
      <rect y={ground} width={width} height={unit * 2} fill="#1b1b20" />
      {lampXs.map((x) => (
        <g key={x}>
          <rect x={x + 2} y={ground - 12} width="2" height="12" fill="#42434d" />
          <rect x={x} y={ground - 15} width="6" height="4" fill="#bab1ff" />
        </g>
      ))}
    </svg>
  )
}
