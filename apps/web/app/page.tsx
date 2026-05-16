import { Button } from '@repo/ui'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  return (
    <main className="min-h-screen px-6 py-12 sm:py-16">
      <section className="mx-auto grid w-full max-w-4xl gap-8">
        <div className="grid gap-4">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {t('heading')}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">{t('intro')}</p>
        </div>

        <div className="grid gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground">
          <div className="grid gap-2">
            <h2 className="text-lg font-semibold text-foreground">{t('caseStudyTitle')}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{t('caseStudyBody')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/deals/northstar-energy">{t('dealLink')}</Link>
            </Button>
            <p className="text-sm text-muted-foreground">{t('status')}</p>
          </div>
        </div>
      </section>
    </main>
  )
}
