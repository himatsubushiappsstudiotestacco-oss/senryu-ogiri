'use client'

import { useTransition } from 'react'
import { restoreAnswer, restoreTopic } from '@/app/actions'

type Props =
  | { type: 'answer'; id: string }
  | { type: 'topic'; id: string }

export default function RestoreButton({ type, id }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      if (type === 'answer') {
        await restoreAnswer(id)
      } else {
        await restoreTopic(id)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-indigo-400 hover:text-indigo-600 disabled:opacity-50 transition-colors shrink-0"
    >
      {isPending ? '…' : '復元'}
    </button>
  )
}
