'use client'

import { Button } from '@repo/ui/components/button'
import { useTranslations } from 'next-intl'

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('RootError')

  return (
    <main className="min-h-screen px-6 py-16">
      <section className="mx-auto grid max-w-3xl gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{t('heading')}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{t('body')}</p>
        <Button className="w-fit" onClick={reset} type="button">
          {t('reset')}
        </Button>
      </section>
    </main>
  )
}
