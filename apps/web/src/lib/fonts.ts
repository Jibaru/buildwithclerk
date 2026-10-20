import { Geist_Mono, Inter } from 'next/font/google'

// clerk.com uses Suisse Intl and Söhne Mono under licence. These are the stand-ins;
// swap by pointing --font-inter / --font-geist-mono at next/font/local once licensed.
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  axes: ['opsz'],
})

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})
