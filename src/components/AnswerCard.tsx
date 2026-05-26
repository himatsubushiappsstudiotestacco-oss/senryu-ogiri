import LikeButton from './LikeButton'
import ReportButton from './ReportButton'
import type { Answer } from '@/types'

type Props = {
  answer: Answer
  topicId: string
  currentUserId: string | null
  rank?: number
}

export default function AnswerCard({ answer, topicId, currentUserId, rank }: Props) {
  const isOwn = currentUserId === answer.user_id
  const isLoggedIn = !!currentUserId

  const showRank = rank !== undefined && rank <= 3 && answer.likes_count >= 1

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-4
      ${showRank && rank === 1 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'}
    `}>
      {showRank && (
        <div className="text-sm font-bold mb-2 text-yellow-600">
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'} {rank}位
        </div>
      )}

      <div className="text-center my-3">
        <p className="text-lg font-medium text-indigo-700 tracking-widest">{answer.naka_no_ku}</p>
        <p className="text-lg font-medium text-indigo-700 tracking-widest">{answer.shimo_no_ku}</p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {answer.profiles?.username ?? '匿名'}
          </span>
          <span className="text-xs text-gray-300">
            {new Date(answer.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ReportButton answerId={answer.id} topicId={topicId} isLoggedIn={isLoggedIn} />
          <LikeButton
            answerId={answer.id}
            topicId={topicId}
            initialCount={answer.likes_count}
            initialLiked={answer.user_has_liked ?? false}
            isOwn={isOwn}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>

      {isOwn && (
        <div className="mt-1 text-right">
          <span className="text-xs text-indigo-400">自分の句</span>
        </div>
      )}
    </div>
  )
}
