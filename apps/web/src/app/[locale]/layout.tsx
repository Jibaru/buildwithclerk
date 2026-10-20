import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/constants'
import { geistMono, inter } from '@/lib/fonts'
import '@/styles/globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'site' })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${t('name')} · ${t('tagline')}`, template: `%s · ${t('name')}` },
    description: t('description'),
    openGraph: { siteName: t('name'), type: 'website', locale: locale === 'es' ? 'es_ES' : 'en_US' },
    alternates: { languages: { en: '/', es: '/es' } },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <ClerkProvider signInUrl={`/${locale === 'en' ? '' : `${locale}/`}sign-in`} afterSignOutUrl="/">
          <NextIntlClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  )
}
