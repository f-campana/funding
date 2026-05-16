import { Button } from '@repo/ui'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('NotFound')

  return (
    <main className="min-h-screen px-6 py-16">
      <section className="mx-auto grid max-w-3xl gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{t('heading')}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{t('body')}</p>
        <Button asChild className="w-fit">
          <Link href="/">{t('homeLink')}</Link>
        </Button>
      </section>
    </main>
  )
}
