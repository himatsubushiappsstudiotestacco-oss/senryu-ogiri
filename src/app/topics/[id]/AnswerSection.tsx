'use client'

import { useState } from 'react'
import { postAnswer } from '@/app/actions'
import ReadingInput from '@/components/ReadingInput'

type Props = {
  topicId: string
  isOpen: boolean
  isLoggedIn: boolean
  hasAnswered: boolean
}

const isAllHiragana = (text: string) => /^[぀-ゟー]*$/.test(text)

export default function AnswerSection({ topicId, isOpen, isLoggedIn, hasAnswered }: Props) {
  const [naka, setNaka] = useState('')
  const [nakaReading, setNakaReading] = useState('')
  const [shimo, setShimo] = useState('')
  const [shimoReading, setShimoReading] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const nakaReadingValid = /^[぀-ゟー]+$/.test(nakaReading) && nakaReading.length >= 5 && nakaReading.length <= 9
  const shimoReadingValid = /^[぀-ゟー]+$/.test(shimoReading) && shimoReading.length >= 3 && shimoReading.length <= 7
  const canSubmit = naka.length > 0 && nakaReadingValid && shimo.length > 0 && shimoReadingValid && !loading

  function handleNakaChange(value: string) {
    setNaka(value)
    if (isAllHiragana(value)) setNakaReading(value)
  }

  function handleShimoChange(value: string) {
    setShimo(value)
    if (isAllHiragana(value)) setShimoReading(value)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await postAnswer(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setOpen(false)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  if (!isLoggedIn) {
    return (
      <div className="bg-indigo-50 rounded-2xl p-5 text-center">
        <p className="text-indigo-700 font-medium mb-2">下の句を投稿する</p>
        <p className="text-sm text-indigo-500 mb-3">ログインして参加しよう！</p>
        <a
          href="/auth/login"
          className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          ログイン
        </a>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-200">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-emerald-700 font-medium">投稿しました！いいねを集めよう</p>
      </div>
    )
  }

  if (hasAnswered) {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 text-center text-sm text-gray-500">
        ✓ 回答済みです
      </div>
    )
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-medium hover:bg-indigo-700 transition-colors"
        >
          ✍️ 下の句を投稿する
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="hidden" name="topic_id" value={topicId} />

            {/* 中の句 */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">中の句</label>
              <input
                name="naka_no_ku"
                type="text"
                value={naka}
                onChange={e => handleNakaChange(e.target.value)}
                placeholder="例: のどかに揺れる"
                maxLength={15}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-center tracking-wider text-indigo-700 font-medium focus:outline-none focus:border-indigo-400"
                required
              />
              <div className="mt-1">
                <ReadingInput
                  name="naka_no_ku_reading"
                  value={nakaReading}
                  onChange={setNakaReading}
                  min={5}
                  max={9}
                  placeholder="読み（7音±2 = 5〜9文字）"
                />
              </div>
            </div>

            {/* 下の句 */}
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">下の句</label>
              <input
                name="shimo_no_ku"
                type="text"
                value={shimo}
                onChange={e => handleShimoChange(e.target.value)}
                placeholder="例: 花びらかな"
                maxLength={15}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-center tracking-wider text-indigo-700 font-medium focus:outline-none focus:border-indigo-400"
                required
              />
              <div className="mt-1">
                <ReadingInput
                  name="shimo_no_ku_reading"
                  value={shimoReading}
                  onChange={setShimoReading}
                  min={3}
                  max={7}
                  placeholder="読み（5音±2 = 3〜7文字）"
                />
              </div>
            </div>

            {/* プレビュー */}
            {(naka || shimo) && (
              <div className="bg-indigo-50 rounded-xl p-3 text-center text-indigo-800 text-sm font-medium tracking-widest">
                <span className="text-gray-400 text-xs block mb-1">プレビュー</span>
                {naka && <p>{naka}</p>}
                {shimo && <p>{shimo}</p>}
              </div>
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40"
              >
                {loading ? '投稿中...' : '投稿する'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
