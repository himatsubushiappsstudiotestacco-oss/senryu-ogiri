'use client'

import { useState } from 'react'
import { reportAnswer } from '@/app/actions'

type Props = {
  answerId: string
  topicId: string
  isLoggedIn: boolean
}

export default function ReportButton({ answerId, topicId, isLoggedIn }: Props) {
  const [reported, setReported] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleReport() {
    const result = await reportAnswer(answerId, topicId)
    if (result.success) setReported(true)
    setConfirming(false)
  }

  if (!isLoggedIn) return null
  if (reported) return <span className="text-xs text-gray-400">通報済み</span>

  return confirming ? (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">本当に通報しますか？</span>
      <button onClick={handleReport} className="text-xs text-red-500 font-medium">はい</button>
      <button onClick={() => setConfirming(false)} className="text-xs text-gray-400">いいえ</button>
    </div>
  ) : (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
    >
      通報
    </button>
  )
}
