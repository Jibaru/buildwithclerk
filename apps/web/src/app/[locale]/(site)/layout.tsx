import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'

/** Every page except the city gets the clerk.com-style chrome. */
export default function SiteLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
