import { KeyMark } from '@/components/site/Logo'
import { Container } from '@/components/ui/Container'

/** Dark, HUD-like frame shared by sign-in and sign-up. The forms inside are Clerk Elements. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="dot-grid relative isolate bg-gray-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(108,71,255,0.25),transparent)]" />
      <Container className="flex min-h-[80dvh] items-center justify-center py-16">
        <div className="w-full max-w-sm rounded-2xl bg-gray-900/80 p-6 ring-[0.5px] ring-white/10 backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-2">
            <KeyMark className="size-6 text-purple-400" />
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </Container>
    </section>
  )
}
