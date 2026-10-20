import { cn } from '@/lib/cn'

export function Container({ className, ...props }: React.ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 sm:max-w-[40rem] md:max-w-[48rem] md:px-8 lg:max-w-[64rem] xl:max-w-[79rem]',
        className,
      )}
      {...props}
    />
  )
}
