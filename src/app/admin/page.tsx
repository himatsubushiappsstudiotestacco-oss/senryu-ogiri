export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { adminRestoreAnswer, adminDeleteAnswer } from '@/app/actions'

async function restore(id: string): Promise<void> {
  'use server'
  await adminRestoreAnswer(id)
}

async function remove(id: string): Promise<void> {
  'use server'
  await adminDeleteAnswer(id)
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  const { data: reported } = await supabase
    .from('answers')
    .select('*, profiles(username), topics(kami_no_ku)')
    .gte('report_count', 1)
    .order('report_count', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-900">管理画面</h1>
        <span className="text-xs text-gray-400">管理者のみ</span>
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">
          通報された回答 ({reported?.length ?? 0}件)
        </h2>

        {(reported?.length ?? 0) === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
            通報された回答はありません
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reported?.map(answer => (
              <div key={answer.id} className={`bg-white rounded-2xl border p-4 ${answer.is_hidden ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    お題: 「{(answer.topics as { kami_no_ku: string })?.kami_no_ku}」
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${answer.is_hidden ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'}`}>
                    通報 {answer.report_count}件 {answer.is_hidden ? '(非表示)' : ''}
                  </span>
                </div>
                <p className="text-sm font-medium text-indigo-700 tracking-wider">
                  {answer.naka_no_ku} / {answer.shimo_no_ku}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  by {(answer.profiles as { username: string })?.username}
                </p>

                <div className="flex gap-2 mt-3">
                  <form action={restore.bind(null, answer.id)}>
                    <button type="submit" className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-200 transition-colors">
                      復元する
                    </button>
                  </form>
                  <form action={remove.bind(null, answer.id)}>
                    <button type="submit" className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-200 transition-colors">
                      削除する
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
