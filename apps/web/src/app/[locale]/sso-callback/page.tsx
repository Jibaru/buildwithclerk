import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { SSOCallback } from '@/components/auth/SSOCallback'

export default async function SSOCallbackPage({ params }: PageProps<'/[locale]/sso-callback'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('auth')
  return (
    <AuthShell title={t('verifying')} subtitle={t('signInSubtitle')}>
      <SSOCallback />
      <div className="mx-auto size-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent motion-reduce:animate-none" />
    </AuthShell>
  )
}
