import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-indigo-800 tracking-wider">
          川柳大喜利
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/topics/new"
                className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-full font-medium hover:bg-indigo-700 transition-colors"
              >
                ＋ お題
              </Link>
              <Link
                href="/profile"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                マイページ
              </Link>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
