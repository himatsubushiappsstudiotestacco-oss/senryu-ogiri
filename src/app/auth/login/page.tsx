'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('ユーザー名を入力してください')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('確認メールを送信しました。メールのリンクをクリックしてください。')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('メールアドレスまたはパスワードが間違っています')
      } else {
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-900">川柳大喜利</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'ログインして句を詠もう' : 'アカウント登録'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">ユーザー名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="俳諧太郎"
                maxLength={20}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600 block mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6文字以上"
              minLength={6}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative text-center">
              <span className="bg-white px-2 text-xs text-gray-400">または</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Googleでログイン
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? (
            <>アカウントがない方は{' '}
              <button onClick={() => setMode('signup')} className="text-indigo-600 hover:underline">新規登録</button>
            </>
          ) : (
            <>すでにアカウントをお持ちの方は{' '}
              <button onClick={() => setMode('login')} className="text-indigo-600 hover:underline">ログイン</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
