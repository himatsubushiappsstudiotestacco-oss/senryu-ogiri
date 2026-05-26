'use client'

import { debugCloseTopic, debugReopenTopic } from '@/app/actions'

type Props = {
  topicId: string
  isOpen: boolean
}

export default function DebugPanel({ topicId, isOpen }: Props) {
  return (
    <div className="border border-dashed border-orange-300 bg-orange-50 rounded-2xl p-4">
      <p className="text-xs font-bold text-orange-500 mb-3">🛠 デバッグ（出題者のみ表示）</p>
      <div className="flex gap-3">
        {isOpen ? (
          <form action={debugCloseTopic.bind(null, topicId)}>
            <button
              type="submit"
              className="text-sm bg-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              締切をシミュレート
            </button>
          </form>
        ) : (
          <form action={debugReopenTopic.bind(null, topicId)}>
            <button
              type="submit"
              className="text-sm bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              締切を解除（7日後に再設定）
            </button>
          </form>
        )}
      </div>
      <p className="text-xs text-orange-400 mt-2">
        現在: {isOpen ? '募集中' : '締切済み'}
      </p>
    </div>
  )
}
