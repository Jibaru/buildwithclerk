import { redirect } from '@/i18n/navigation'

export default async function CityRedirect({ params }: PageProps<'/[locale]/city'>) {
  const { locale } = await params
  redirect({ href: '/', locale })
}
