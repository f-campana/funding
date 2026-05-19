'use client'

import { Skeleton } from '@repo/ui/components/skeleton'
import { useTranslations } from 'next-intl'

export default function Loading() {
  const t = useTranslations('RootLoading')

  return (
    <main aria-busy="true" className="min-h-screen px-6 py-16">
      <section className="mx-auto grid max-w-4xl gap-6" role="status">
        <p className="text-sm font-medium text-muted-foreground">{t('label')}</p>
        <div className="grid gap-3">
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      </section>
    </main>
  )
}
