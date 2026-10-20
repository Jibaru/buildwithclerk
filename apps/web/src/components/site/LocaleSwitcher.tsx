'use client'

import { useLocale } from 'next-intl'
import { button } from '@/components/ui/Button'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/cn'

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale
  return (
    <Link
      href={pathname}
      locale={next}
      className={cn(button({ variant: 'ghost', size: 'sm' }), 'font-mono uppercase', className)}
      aria-label={next === 'es' ? 'Cambiar a español' : 'Switch to English'}
    >
      {next}
    </Link>
  )
}
