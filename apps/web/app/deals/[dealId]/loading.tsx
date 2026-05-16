'use client'

import { Skeleton } from '@repo/ui'
import { useTranslations } from 'next-intl'

export default function DealLoading() {
  const t = useTranslations('DealLoading')

  return (
    <main aria-busy="true" className="min-h-screen px-6 py-8 sm:py-12">
      <section className="mx-auto grid w-full max-w-7xl gap-8" role="status">
        <div className="grid gap-3">
          <p className="text-sm font-medium text-muted-foreground">{t('label')}</p>
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-4 w-full max-w-3xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-96" />
          <div className="grid content-start gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </section>
    </main>
  )
}
