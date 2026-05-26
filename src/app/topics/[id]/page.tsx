export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import AnswerCard from '@/components/AnswerCard'
import AnswerSection from './AnswerSection'
import StickyTopicHeader from '@/components/StickyTopicHeader'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: topic } = await supabase
    .from('topics')
    .select('*, profiles(username)')
    .eq('id', id)
    .single()

  if (!topic) notFound()

  const { data: answers } = await supabase
    .from('answers')
    .select('*, profiles(username)')
    .eq('topic_id', id)
    .eq('is_hidden', false)
    .order('likes_count', { ascending: false })

  let likedIds = new Set<string>()
  let hasAnswered = false

  if (user) {
    const { data: likes } = await supabase
      .from('likes')
      .select('answer_id')
      .eq('user_id', user.id)
      .in('answer_id', (answers ?? []).map(a => a.id))

    likedIds = new Set(likes?.map(l => l.answer_id) ?? [])
    hasAnswered = (answers ?? []).some(a => a.user_id === user.id)
  }

  const formattedAnswers = (answers ?? []).map(a => ({
    ...a,
    user_has_liked: likedIds.has(a.id),
  }))

  const isOpen = topic.status === 'open' && new Date(topic.closes_at) > new Date()
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(topic.closes_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 一覧に戻る</Link>

      {/* スティッキー上の句ヘッダー（スクロール時に表示） */}
      <StickyTopicHeader
        kamiNoKu={topic.kami_no_ku}
        reading={topic.kami_no_ku_reading ?? null}
        sentinelId="topic-card-sentinel"
      />

      {/* お題カード */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-xs text-gray-400 mb-1">上の句</p>
        <p className="text-3xl font-bold text-indigo-800 tracking-[0.25em] my-3">
          {topic.kami_no_ku}
        </p>
        {topic.kami_no_ku_reading && topic.kami_no_ku_reading !== topic.kami_no_ku && (
          <p className="text-sm text-gray-400 tracking-widest">（{topic.kami_no_ku_reading}）</p>
        )}
        {topic.description && (
          <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
        )}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <span>出題: {topic.profiles?.username ?? '匿名'}</span>
          {isOpen ? (
            <span className="text-emerald-500 font-medium">
              {daysLeft > 0 ? `残り${daysLeft}日` : '本日締切'}
            </span>
          ) : (
            <span className="bg-gray-100 px-2 py-0.5 rounded-full">締切済み</span>
          )}
        </div>
        {/* センチネル：カードの末尾を検知してスティッキーヘッダーを出す */}
        <div id="topic-card-sentinel" />
      </div>

      {/* 回答フォーム */}
      <AnswerSection
        topicId={id}
        isOpen={isOpen}
        isLoggedIn={!!user}
        hasAnswered={hasAnswered}
      />

      {/* 回答一覧 */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          {formattedAnswers.length > 0
            ? `${formattedAnswers.length}句 · いいね順`
            : 'まだ回答がありません'}
        </h2>
        <div className="flex flex-col gap-3">
          {formattedAnswers.map((answer, i) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              topicId={id}
              currentUserId={user?.id ?? null}
              rank={i + 1}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
