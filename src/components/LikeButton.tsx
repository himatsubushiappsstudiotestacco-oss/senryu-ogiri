'use client'

import { useState } from 'react'
import { toggleLike } from '@/app/actions'

type Props = {
  answerId: string
  topicId: string
  initialCount: number
  initialLiked: boolean
  isOwn: boolean
  isLoggedIn: boolean
}

export default function LikeButton({
  answerId,
  topicId,
  initialCount,
  initialLiked,
  isOwn,
  isLoggedIn,
}: Props) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (isOwn || !isLoggedIn || loading) return
    setLoading(true)
    setCount(c => liked ? c - 1 : c + 1)
    setLiked(l => !l)
    await toggleLike(answerId, topicId)
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isOwn || !isLoggedIn || loading}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all
        ${liked
          ? 'bg-rose-100 text-rose-600 border border-rose-300'
          : 'bg-gray-100 text-gray-500 border border-gray-200'}
        ${isOwn || !isLoggedIn ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
      `}
      title={isOwn ? '自分の回答にはいいねできません' : !isLoggedIn ? 'ログインしていいねしよう' : ''}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
