import { createClient } from '@/lib/supabase/server'
import TopicCard from '@/components/TopicCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SearchParams = { tab?: string; sort?: string; period?: string }

const PERIOD_DAYS: Record<string, number> = { week: 7, month: 30, year: 365 }

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { tab, sort, period } = await searchParams
  const isOpen = tab !== 'closed'
  const isPopular = sort === 'popular'
  const activePeriod = (!isOpen && PERIOD_DAYS[period ?? '']) ? period! : 'month'

  const supabase = await createClient()

  let query = supabase
    .from('topics')
    .select(`*, profiles(username), answers(count)`)
    .eq('status', isOpen ? 'open' : 'closed')

  if (!isOpen) {
    const since = new Date(Date.now() - PERIOD_DAYS[activePeriod] * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('closes_at', since)
  }

  if (isPopular) {
    query = query
      .order('total_likes_received', { ascending: false })
      .order('answers_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: topics } = await query.limit(50)

  const formattedTopics = (topics ?? []).map(t => ({
    ...t,
    answers_count: (t.answers as { count: number }[])?.[0]?.count ?? 0,
  }))

  const tabBase = isOpen ? '/?tab=open' : '/?tab=closed'
  const withSort = (s: string) => `${tabBase}&sort=${s}${!isOpen ? `&period=${activePeriod}` : ''}`
  const withPeriod = (p: string) => `${tabBase}&sort=${sort ?? 'new'}&period=${p}`

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">川柳大喜利</h1>
        <p className="text-sm text-gray-500 mt-1">上の句に、あなたの下の句を</p>
      </div>

      {/* タブ */}
      <div className="flex rounded-full bg-gray-100 p-1 mb-3">
        <Link href={`/?tab=open&sort=${sort ?? 'new'}`}
          className={`flex-1 text-center text-sm py-1.5 rounded-full font-medium transition-all ${isOpen ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
          募集中
        </Link>
        <Link href={`/?tab=closed&sort=${sort ?? 'new'}&period=${activePeriod}`}
          className={`flex-1 text-center text-sm py-1.5 rounded-full font-medium transition-all ${!isOpen ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
          締切済み
        </Link>
      </div>

      {/* ソートと期間フィルター */}
      <div className="flex items-center justify-between mb-4 gap-2">
        {/* ソート切替 */}
        <div className="flex rounded-full bg-gray-100 p-0.5 text-xs">
          <Link href={withSort('new')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${!isPopular ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
            新着順
          </Link>
          <Link href={withSort('popular')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${isPopular ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
            人気順
          </Link>
        </div>

        {/* 締切済みの期間フィルター */}
        {!isOpen && (
          <div className="flex rounded-full bg-gray-100 p-0.5 text-xs">
            {(['week', 'month', 'year'] as const).map(p => (
              <Link key={p} href={withPeriod(p)}
                className={`px-3 py-1 rounded-full font-medium transition-all ${activePeriod === p ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>
                {p === 'week' ? '1週間' : p === 'month' ? '1ヶ月' : '1年'}
              </Link>
            ))}
          </div>
        )}
      </div>

      {formattedTopics.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌸</p>
          <p>お題がありません</p>
          {isOpen && (
            <Link href="/topics/new" className="mt-4 inline-block text-indigo-600 font-medium hover:underline">
              最初のお題を投稿する →
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {formattedTopics.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  )
}
