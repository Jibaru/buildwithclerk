import type { Platform } from '@buildwithclerk/registry'

const paths: Record<Platform, string> = {
  web: 'M2 4h12v8H2zM2 6h12M5 13h6',
  mobile: 'M5 1.5h6v13H5zM7 12.5h2',
  desktop: 'M2 3h12v8H2zM6 13h4M8 11v2',
  tv: 'M2 3h12v8H2zM5 13h6M8 11v2M6 1l2 2 2-2',
  cli: 'M2 3h12v10H2zM4.5 6l2 2-2 2M8 10h3',
  backend: 'M2 3h12v3H2zM2 10h12v3H2zM4.5 4.5h.01M4.5 11.5h.01',
  extension: 'M4 2h4v2h2V2h2v4h2v4h-2v2h2v2H4v-2H2V8h2V6H2V4h2z',
  bot: 'M3 5h10v8H3zM6 8h.01M10 8h.01M8 2v3M6 11h4',
  agent: 'M8 1.5l1.8 3.7 4 .6-2.9 2.8.7 4L8 10.7l-3.6 1.9.7-4L2.2 5.8l4-.6z',
}

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={paths[platform]} />
    </svg>
  )
}
