import { cn } from '@/lib/cn'

/**
 * clerk.com's signature: a soft purple radial glow behind a card. Pure CSS, blends with
 * light and dark backgrounds, respects the parent's overflow.
 */
export function Glow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10',
        'bg-[radial-gradient(60%_60%_at_50%_45%,color-mix(in_srgb,var(--color-purple-500)_45%,transparent),transparent_70%)]',
        'dark:bg-[radial-gradient(60%_60%_at_50%_45%,color-mix(in_srgb,var(--color-purple-500)_55%,transparent),transparent_70%)]',
        className,
      )}
    />
  )
}

/** The brand gradient clerk.com reserves for glows: purple-500 → sky-300. */
export function BrandGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute -z-10 rounded-full bg-linear-to-br from-purple-500 to-sky-500 opacity-30 blur-3xl dark:opacity-40',
        className,
      )}
    />
  )
}
