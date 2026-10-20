'use client'

import { useSignUp } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { FieldError, GlobalErrors, ProviderIcon, styles as s } from './FormBits'
import { useFinalizeNavigate } from './useFinalize'

type Step = 'start' | 'code'

export function SignUpForm() {
  const t = useTranslations('auth')
  const { signUp, errors, fetchStatus } = useSignUp()
  const navigate = useFinalizeNavigate()
  const [step, setStep] = useState<Step>('start')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const busy = fetchStatus === 'fetching'

  async function sendCode(event: FormEvent) {
    event.preventDefault()
    const created = await signUp.create({ emailAddress: email })
    if (created.error) return
    const sent = await signUp.verifications.sendEmailCode()
    if (!sent.error) setStep('code')
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault()
    const verified = await signUp.verifications.verifyEmailCode({ code })
    if (verified.error) return
    if (signUp.status === 'complete') await signUp.finalize({ navigate })
  }

  async function withProvider(provider: 'github' | 'google') {
    await signUp.sso({
      strategy: `oauth_${provider}`,
      redirectUrl: '/',
      redirectCallbackUrl: '/sso-callback',
    })
  }

  if (step === 'code') {
    return (
      <form onSubmit={verifyCode} className="flex flex-col gap-4">
        <div className={s.field}>
          <label htmlFor="code" className={s.label}>
            {t('code')}
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={s.otp}
            aria-invalid={Boolean(errors.fields.code)}
          />
          <FieldError error={errors.fields.code} />
        </div>
        <p className="text-xs text-gray-500">
          {t('codeHint')} <span className="text-gray-300">{email}</span>
        </p>
        <button type="submit" className={s.primary} disabled={busy}>
          {busy ? t('verifying') : t('continue')}
        </button>
        <GlobalErrors errors={errors.global} />
      </form>
    )
  }

  return (
    <form onSubmit={sendCode} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <button type="button" className={s.secondary} disabled={busy} onClick={() => withProvider('github')}>
          <ProviderIcon provider="github" />
          {t('continueWith', { provider: 'GitHub' })}
        </button>
        <button type="button" className={s.secondary} disabled={busy} onClick={() => withProvider('google')}>
          <ProviderIcon provider="google" />
          {t('continueWith', { provider: 'Google' })}
        </button>
      </div>
      <p className={s.divider}>{t('or')}</p>
      <div className={s.field}>
        <label htmlFor="emailAddress" className={s.label}>
          {t('email')}
        </label>
        <input
          id="emailAddress"
          name="emailAddress"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={s.input}
          aria-invalid={Boolean(errors.fields.emailAddress)}
        />
        <FieldError error={errors.fields.emailAddress} />
      </div>
      {/* Clerk Protect / bot detection renders its widget here when the instance requires it. */}
      <div id="clerk-captcha" className="empty:hidden" />
      <button type="submit" className={s.primary} disabled={busy}>
        {busy ? t('verifying') : t('continue')}
      </button>
      <FieldError error={errors.fields.captcha} />
      <GlobalErrors errors={errors.global} />
      <p className="text-center text-sm text-gray-400">
        {t('haveAccount')}{' '}
        <Link href="/sign-in" className={s.link}>
          {t('signIn')}
        </Link>
      </p>
    </form>
  )
}
