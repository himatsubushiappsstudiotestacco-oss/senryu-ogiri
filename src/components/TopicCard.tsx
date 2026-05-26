import Link from 'next/link'
import type { Topic } from '@/types'

type Props = { topic: Topic }

export default function TopicCard({ topic }: Props) {
  const daysLeft = Math.max(0, Math.ceil(
    (new Date(topic.closes_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ))

  return (
    <Link href={`/topics/${topic.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition-all active:scale-98">
        <div className="text-center mb-3">
          <p className="text-2xl font-bold text-indigo-800 tracking-[0.2em]">
            {topic.kami_no_ku}
          </p>
          <p className="text-sm text-gray-400 mt-1">〜 下の句を募集中 〜</p>
        </div>

        {topic.description && (
          <p className="text-sm text-gray-500 text-center mb-3">{topic.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 mt-3 border-t pt-3">
          <span>{topic.profiles?.username ?? '匿名'}</span>
          <div className="flex items-center gap-3">
            <span>💬 {topic.answers_count ?? 0}句</span>
            {topic.status === 'open' ? (
              <span className="text-emerald-500 font-medium">
                {daysLeft > 0 ? `残り${daysLeft}日` : '本日締切'}
              </span>
            ) : (
              <span className="text-gray-400">締切済み</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
