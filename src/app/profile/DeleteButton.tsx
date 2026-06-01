'use client'

import { useTransition } from 'react'
import { deleteAnswer, deleteTopic } from '@/app/actions'

type Props =
  | { type: 'answer'; id: string }
  | { type: 'topic'; id: string }

export default function DeleteButton({ type, id }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(type === 'answer' ? 'この回答を削除しますか？' : 'このお題を削除しますか？（回答もすべて削除されます）')) return
    startTransition(async () => {
      if (type === 'answer') {
        await deleteAnswer(id)
      } else {
        await deleteTopic(id)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-gray-300 hover:text-red-400 disabled:opacity-50 transition-colors ml-2 shrink-0"
      title="削除"
    >
      {isPending ? '…' : '削除'}
    </button>
  )
}
