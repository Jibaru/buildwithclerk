import { cn } from '@/lib/cn'

/** A pixel key. The site's mark, also the icon demos show when they hand you a key. */
export function KeyMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      shapeRendering="crispEdges"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M3 2h5v1H3zM2 3h1v5H2zM8 3h1v5H8zM3 8h5v1H3zM4 4h3v3H4zM8 5h7v1H8zM13 6h1v2h-1zM11 6h1v2h-1zM9 6h1v1H9z"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-semibold tracking-tight text-gray-950 dark:text-white',
        className,
      )}
    >
      <KeyMark className="text-purple-500" />
      <span>
        Build with&nbsp;<span className="text-purple-500">Clerk</span>
      </span>
    </span>
  )
}
