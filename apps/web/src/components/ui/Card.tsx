import { cn } from '@/lib/cn'

export function Card({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white shadow-card dark:bg-gray-900 dark:shadow-none dark:ring-[0.5px] dark:ring-white/10 dark:ring-inset',
        className,
      )}
      {...props}
    />
  )
}
