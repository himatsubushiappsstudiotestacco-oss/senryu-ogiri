export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })

  const { data: myTopics } = await supabase
    .from('topics')
    .select('id, kami_no_ku, status, closes_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: myAnswers } = await supabase
    .from('answers')
    .select('id, naka_no_ku, shimo_no_ku, likes_count, topic_id, topics(kami_no_ku)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* プロフィールヘッダー */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl mx-auto mb-3">
          🌸
        </div>
        <h1 className="text-xl font-bold text-indigo-900">{profile?.username}</h1>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-700">{profile?.total_likes_received ?? 0}</p>
            <p className="text-xs">獲得いいね</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-700">{profile?.total_topics ?? 0}</p>
            <p className="text-xs">出題数</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-indigo-700">{profile?.total_answers ?? 0}</p>
            <p className="text-xs">回答数</p>
          </div>
        </div>
      </div>

      {/* バッジ */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">バッジ</h2>
        {(userBadges?.length ?? 0) === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center text-sm text-gray-400">
            まだバッジを取得していません。お題や回答を投稿してみよう！
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {userBadges?.map(ub => (
              <div key={ub.badge_id} className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-2xl mb-1">{(ub.badges as { icon: string })?.icon}</div>
                <p className="text-xs font-medium text-gray-700">{(ub.badges as { name: string })?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{(ub.badges as { description: string })?.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 自分の出題 */}
      {(myTopics?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">自分のお題</h2>
          <div className="flex flex-col gap-2">
            {myTopics?.map(t => (
              <Link key={t.id} href={`/topics/${t.id}`} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between hover:border-indigo-200 transition-colors">
                <span className="font-medium text-indigo-800 tracking-wider">{t.kami_no_ku}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {t.status === 'open' ? '募集中' : '締切済'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 自分の回答 */}
      {(myAnswers?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">自分の回答</h2>
          <div className="flex flex-col gap-2">
            {myAnswers?.map(a => (
              <Link key={a.id} href={`/topics/${a.topic_id}`} className="bg-white rounded-xl border border-gray-100 p-3 hover:border-indigo-200 transition-colors">
                <p className="text-xs text-gray-400 mb-1">
                  「{(a.topics as unknown as { kami_no_ku: string })?.kami_no_ku}」への回答
                </p>
                <p className="text-sm font-medium text-indigo-700 tracking-wider">{a.naka_no_ku} / {a.shimo_no_ku}</p>
                <p className="text-xs text-rose-500 mt-1">❤️ {a.likes_count}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ログアウト */}
      <form action={signOut}>
        <button type="submit" className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
          ログアウト
        </button>
      </form>
    </div>
  )
}
