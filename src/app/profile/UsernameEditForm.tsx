'use client'

import { useState, useTransition } from 'react'
import { updateUsername } from '@/app/actions'

export default function UsernameEditForm({ initialUsername }: { initialUsername: string }) {
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(initialUsername)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSave(formData: FormData) {
    setError('')
    startTransition(async () => {
      const result = await updateUsername(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-xl font-bold text-indigo-900">{username}</h1>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-400 hover:text-indigo-500 transition-colors"
        >
          編集
        </button>
      </div>
    )
  }

  return (
    <form action={handleSave} className="flex flex-col items-center gap-2">
      <input
        name="username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        maxLength={20}
        className="border border-indigo-300 rounded-xl px-3 py-1.5 text-sm text-center focus:outline-none focus:border-indigo-500 w-40"
        autoFocus
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? '保存中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setUsername(initialUsername); setError('') }}
          className="text-xs text-gray-500 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
