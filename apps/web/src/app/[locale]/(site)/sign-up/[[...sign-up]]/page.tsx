import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AuthShell } from '@/components/auth/AuthShell'
import { SignUpForm } from '@/components/auth/SignUpForm'

export default async function SignUpPage({ params }: PageProps<'/[locale]/sign-up/[[...sign-up]]'>) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('auth')
  return (
    <AuthShell title={t('signUpTitle')} subtitle={t('signUpSubtitle')}>
      <SignUpForm />
    </AuthShell>
  )
}
