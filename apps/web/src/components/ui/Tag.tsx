import { cn } from '@/lib/cn'

/** The mono, uppercase eyebrow clerk.com calls `tag-1`. */
export function Tag({ className, ...props }: React.ComponentPropsWithRef<'span'>) {
  return <span className={cn('tag-1 text-gray-600 dark:text-gray-400', className)} {...props} />
}
