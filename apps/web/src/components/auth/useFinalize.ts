'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

type NavigateArgs = {
  session?: { currentTask?: { key: string } | null } | null
  decorateUrl: (url: string) => string
}

/**
 * The `navigate` callback both sign-in and sign-up hand to `finalize()`. Session tasks (for
 * example "choose an organization") are not used by this site, so the only destination is home.
 */
export function useFinalizeNavigate(destination = '/') {
  const router = useRouter()
  return useCallback(
    ({ decorateUrl }: NavigateArgs) => {
      const url = decorateUrl(destination)
      if (url.startsWith('http')) {
        window.location.href = url
        return
      }
      router.push(url)
    },
    [router, destination],
  )
}
