import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { SignInForm } from '@/components/auth/SignInForm'

export default async function SignInPage({ params }: PageProps<'/[locale]/sign-in/[[...sign-in]]'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('auth')
  return (
    <AuthShell title={t('signInTitle')} subtitle={t('signInSubtitle')}>
      <SignInForm />
    </AuthShell>
  )
}
