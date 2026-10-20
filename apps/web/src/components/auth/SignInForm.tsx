'use client'

import { useSignIn } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { type FormEvent, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { FieldError, GlobalErrors, ProviderIcon, styles as s } from './FormBits'
import { useFinalizeNavigate } from './useFinalize'

type Step = 'start' | 'code'

/**
 * Custom sign-in on Clerk Core 3's signal-based `useSignIn`: email code, passkeys and OAuth.
 * No prebuilt UI anywhere; every pixel is ours so it can match the city's HUD.
 */
export function SignInForm() {
  const t = useTranslations('auth')
  const { signIn, errors, fetchStatus } = useSignIn()
  const navigate = useFinalizeNavigate()
  const [step, setStep] = useState<Step>('start')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const busy = fetchStatus === 'fetching'

  async function sendCode(event: FormEvent) {
    event.preventDefault()
    const created = await signIn.create({ identifier: email })
    if (created.error) return
    const sent = await signIn.emailCode.sendCode({ emailAddress: email })
    if (!sent.error) setStep('code')
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault()
    const verified = await signIn.emailCode.verifyCode({ code })
    if (verified.error) return
    if (signIn.status === 'complete') await signIn.finalize({ navigate })
  }

  async function withPasskey() {
    const result = await signIn.passkey({ flow: 'discoverable' })
    if (result.error) return
    if (signIn.status === 'complete') await signIn.finalize({ navigate })
  }

  async function withProvider(provider: 'github' | 'google') {
    await signIn.sso({
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
        <button
          type="button"
          className={s.link}
          onClick={async () => {
            await signIn.reset()
            setCode('')
            setStep('start')
          }}
        >
          ← {t('email')}
        </button>
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
        <label htmlFor="identifier" className={s.label}>
          {t('email')}
        </label>
        <input
          id="identifier"
          name="identifier"
          type="email"
          autoComplete="email webauthn"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={s.input}
          aria-invalid={Boolean(errors.fields.identifier)}
        />
        <FieldError error={errors.fields.identifier} />
      </div>
      <button type="submit" className={s.primary} disabled={busy}>
        {busy ? t('verifying') : t('continue')}
      </button>
      <button type="button" className={s.link} disabled={busy} onClick={withPasskey}>
        {t('passkey')}
      </button>
      <GlobalErrors errors={errors.global} />
      <p className="text-center text-sm text-gray-400">
        {t('noAccount')}{' '}
        <Link href="/sign-up" className={s.link}>
          {t('signUp')}
        </Link>
      </p>
    </form>
  )
}
