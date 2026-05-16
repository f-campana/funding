import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <main className="min-h-screen px-6 py-16">
      <section className="mx-auto grid max-w-3xl gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{t('heading')}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{t('body')}</p>
        <Link
          className="inline-flex h-9 w-fit shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="/"
        >
          {t('homeLink')}
        </Link>
      </section>
    </main>
  )
}
