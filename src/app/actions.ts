'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function validateReading(reading: string, min: number, max: number, label: string) {
  if (!reading) return `${label}の読みを入力してください`
  if (!/^[぀-ゟー]+$/.test(reading)) return `${label}の読みはひらがなで入力してください`
  if (reading.length < min || reading.length > max) return `${label}の読みは${min}〜${max}文字にしてください`
  return null
}

export async function postTopic(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const kamiNoKu = (formData.get('kami_no_ku') as string).trim()
  const kamiReading = (formData.get('kami_no_ku_reading') as string).trim()
  const description = (formData.get('description') as string).trim()

  const readingError = validateReading(kamiReading, 3, 7, '上の句')
  if (readingError) return { error: readingError }

  const { data, error } = await supabase
    .from('topics')
    .insert({
      user_id: user.id,
      kami_no_ku: kamiNoKu,
      kami_no_ku_reading: kamiReading,
      description: description || null,
    })
    .select('id')
    .single()

  if (error) return { error: '投稿に失敗しました' }

  await supabase.rpc('increment_total_topics', { uid: user.id })
  await checkAndAwardBadges(user.id)
  revalidatePath('/')
  redirect(`/topics/${data.id}`)
}

export async function postAnswer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const topicId = formData.get('topic_id') as string
  const nakaNoKu = (formData.get('naka_no_ku') as string).trim()
  const nakaReading = (formData.get('naka_no_ku_reading') as string).trim()
  const shimoNoKu = (formData.get('shimo_no_ku') as string).trim()
  const shimoReading = (formData.get('shimo_no_ku_reading') as string).trim()

  const nakaError = validateReading(nakaReading, 5, 9, '中の句')
  if (nakaError) return { error: nakaError }
  const shimoError = validateReading(shimoReading, 3, 7, '下の句')
  if (shimoError) return { error: shimoError }

  const { error } = await supabase.from('answers').insert({
    topic_id: topicId,
    user_id: user.id,
    naka_no_ku: nakaNoKu,
    naka_no_ku_reading: nakaReading,
    shimo_no_ku: shimoNoKu,
    shimo_no_ku_reading: shimoReading,
  })

  if (error) {
    if (error.code === '23505') return { error: 'すでに回答済みです' }
    return { error: '投稿に失敗しました' }
  }

  await supabase.rpc('increment_total_answers', { uid: user.id })
  await checkAndAwardBadges(user.id)
  revalidatePath(`/topics/${topicId}`)
  return { success: true }
}

export async function toggleLike(answerId: string, topicId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('answer_id', answerId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('likes').insert({ answer_id: answerId, user_id: user.id })
    await checkAndAwardBadges(user.id)
  }

  revalidatePath(`/topics/${topicId}`)
  return { success: true }
}

export async function reportAnswer(answerId: string, topicId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインが必要です' }

  const { error } = await supabase.from('reports').insert({
    answer_id: answerId,
    user_id: user.id,
  })

  if (error) {
    if (error.code === '23505') return { error: 'すでに通報済みです' }
    return { error: '通報に失敗しました' }
  }

  revalidatePath(`/topics/${topicId}`)
  return { success: true }
}

export async function debugCloseTopic(topicId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 自分のお題のみ操作可能
  await supabase
    .from('topics')
    .update({ status: 'closed', closes_at: new Date(Date.now() - 1000).toISOString() })
    .eq('id', topicId)
    .eq('user_id', user.id)

  revalidatePath(`/topics/${topicId}`)
}

export async function debugReopenTopic(topicId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const newCloseAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('topics')
    .update({ status: 'open', closes_at: newCloseAt })
    .eq('id', topicId)
    .eq('user_id', user.id)

  revalidatePath(`/topics/${topicId}`)
}

export async function adminRestoreAnswer(answerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { error: '権限がありません' }
  }
  await supabase.from('answers').update({ is_hidden: false, report_count: 0 }).eq('id', answerId)
  await supabase.from('reports').delete().eq('answer_id', answerId)
  revalidatePath('/admin')
  return { success: true }
}

export async function adminDeleteAnswer(answerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { error: '権限がありません' }
  }
  await supabase.from('answers').delete().eq('id', answerId)
  revalidatePath('/admin')
  return { success: true }
}

async function checkAndAwardBadges(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('total_likes_received, total_answers, total_topics')
    .eq('id', userId)
    .single()

  if (!profile) return

  const { data: existing } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  const earned = new Set(existing?.map(b => b.badge_id) ?? [])
  const toAward: string[] = []

  if (!earned.has('debut') && (profile.total_topics > 0 || profile.total_answers > 0)) {
    toAward.push('debut')
  }
  if (!earned.has('answer10') && profile.total_answers >= 10) toAward.push('answer10')
  if (!earned.has('likes10') && profile.total_likes_received >= 10) toAward.push('likes10')
  if (!earned.has('likes50') && profile.total_likes_received >= 50) toAward.push('likes50')
  if (!earned.has('prolific') && profile.total_answers >= 50) toAward.push('prolific')

  if (toAward.length > 0) {
    await supabase.from('user_badges').insert(
      toAward.map(badge_id => ({ user_id: userId, badge_id }))
    )
  }
}
