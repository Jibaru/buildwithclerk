import { cva, type VariantProps } from 'class-variance-authority'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

export const button = cva(
  [
    'group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-medium whitespace-nowrap',
    'transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-purple-500 text-white shadow-button ring-[0.5px] ring-purple-500',
          'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-linear-to-b before:from-white/20 before:opacity-50 before:transition-opacity before:duration-300 hover:before:opacity-100',
        ],
        neutral: [
          'bg-gray-950 text-white shadow-button ring-[0.5px] ring-gray-950 dark:bg-white dark:text-gray-950 dark:ring-white',
          'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-linear-to-b before:from-white/15 before:opacity-50 hover:before:opacity-100 dark:before:from-black/10',
        ],
        secondary: [
          'bg-white text-gray-950 shadow-[0_2px_3px_-1px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(19,19,22,0.18),0_1px_0_0_rgba(255,255,255,0.1)_inset]',
          'dark:bg-gray-700 dark:text-white dark:shadow-[0_2px_3px_-1px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(247,247,248,0.1),0_1px_0_0_rgba(255,255,255,0.1)_inset]',
          'hover:bg-gray-25 dark:hover:bg-gray-750',
        ],
        ghost:
          'text-gray-700 hover:bg-gray-950/5 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white',
      },
      size: {
        base: 'h-[1.875rem] px-3 text-sm',
        lg: 'h-10 px-4 text-base',
        sm: 'h-6 px-2 text-xs',
        icon: 'size-[1.875rem]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'base' },
  },
)

type ButtonVariants = VariantProps<typeof button>

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentPropsWithRef<'button'> & ButtonVariants) {
  return <button className={cn(button({ variant, size }), className)} {...props} />
}

type LinkButtonProps = React.ComponentProps<typeof Link> & ButtonVariants

export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return <Link className={cn(button({ variant, size }), className)} {...props} />
}

export function ExternalLinkButton({
  className,
  variant,
  size,
  ...props
}: React.ComponentPropsWithRef<'a'> & ButtonVariants) {
  return (
    <a className={cn(button({ variant, size }), className)} target="_blank" rel="noreferrer" {...props} />
  )
}
