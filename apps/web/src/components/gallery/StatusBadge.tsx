import type { Status } from '@buildwithclerk/registry'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'

const styles: Record<Status, string> = {
  live: 'bg-green-500/10 text-green-700 ring-green-500/30 dark:text-green-400',
  building: 'bg-purple-500/10 text-purple-700 ring-purple-500/30 dark:text-purple-300',
  planned: 'bg-gray-500/10 text-gray-600 ring-gray-500/30 dark:text-gray-400',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const t = useTranslations('gallery.status')
  return (
    <span
      className={cn(
        'tag-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-[0.5px]',
        styles[status],
        className,
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full bg-current',
          status === 'live' && 'animate-pulse motion-reduce:animate-none',
        )}
      />
      {t(status)}
    </span>
  )
}
