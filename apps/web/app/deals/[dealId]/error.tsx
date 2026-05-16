'use client'

import { Button } from '@repo/ui'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function DealError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('DealError')

  return (
    <main className="min-h-screen px-6 py-16">
      <section className="mx-auto grid max-w-3xl gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{t('heading')}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{t('body')}</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset} type="button">
            {t('reset')}
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t('homeLink')}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
