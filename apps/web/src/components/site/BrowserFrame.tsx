import { cn } from '@/lib/cn'

/** The white browser chrome clerk.com wraps demos in: three dots, a url pill, a hairline. */
export function BrowserFrame({
  url,
  className,
  children,
}: {
  url: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-white shadow-card ring-[0.5px] ring-gray-950/12 dark:bg-gray-900 dark:ring-white/12',
        className,
      )}
    >
      <div className="hairline-b flex h-10 items-center gap-3 px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          <span className="size-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          <span className="size-2 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="mx-auto flex h-6 max-w-xs flex-1 items-center justify-center rounded-md bg-gray-50 px-3 font-mono text-2xs text-gray-500 ring-[0.5px] ring-gray-950/8 dark:bg-gray-950 dark:ring-white/8">
          {url}
        </div>
        <div className="w-10" aria-hidden />
      </div>
      {children}
    </div>
  )
}
