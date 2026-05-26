'use client'

import { useState } from 'react'
import { postTopic } from '@/app/actions'
import { useRouter } from 'next/navigation'
import ReadingInput from '@/components/ReadingInput'

const isAllHiragana = (text: string) => /^[぀-ゟー]*$/.test(text)

export default function NewTopicPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [kamiNoKu, setKamiNoKu] = useState('')
  const [reading, setReading] = useState('')

  function handleKamiChange(value: string) {
    setKamiNoKu(value)
    // 全部ひらがななら読みに自動コピー
    if (isAllHiragana(value)) setReading(value)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await postTopic(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const readingValid = /^[぀-ゟー]+$/.test(reading) && reading.length >= 3 && reading.length <= 7
  const canSubmit = kamiNoKu.length > 0 && readingValid

  return (
    <div>
      <h2 className="text-xl font-bold text-indigo-900 mb-6 text-center">お題を投稿する</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">上の句</label>
            <input
              name="kami_no_ku"
              type="text"
              value={kamiNoKu}
              onChange={e => handleKamiChange(e.target.value)}
              placeholder="例: 春の風"
              maxLength={15}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg text-center tracking-widest text-indigo-800 font-medium focus:outline-none focus:border-indigo-400"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              読み <span className="text-gray-400 font-normal text-xs">（ひらがな・5音±2 = 3〜7文字）</span>
            </label>
            <ReadingInput
              name="kami_no_ku_reading"
              value={reading}
              onChange={setReading}
              min={3}
              max={7}
              placeholder="例: はるのかぜ"
            />
            <p className="text-xs text-gray-400 mt-1 px-1">
              漢字を使った場合はここにひらがなで読みを入力してください
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              補足・テーマ <span className="text-gray-400 font-normal">（任意）</span>
            </label>
            <input
              name="description"
              type="text"
              placeholder="例: 季節の変わり目について"
              maxLength={50}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
            <p className="font-medium mb-1">📝 投稿のルール</p>
            <ul className="space-y-1 text-indigo-600 text-xs">
              <li>・上の句は5音が目安（読みで3〜7文字）</li>
              <li>・締め切りは投稿から7日後</li>
              <li>・下の句で笑わせよう！</li>
            </ul>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-40"
          >
            {loading ? '投稿中...' : '投稿する'}
          </button>
        </form>
      </div>

      <button
        onClick={() => router.back()}
        className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
      >
        ← 戻る
      </button>
    </div>
  )
}
