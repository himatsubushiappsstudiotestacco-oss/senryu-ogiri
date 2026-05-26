export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  total_likes_received: number
  total_topics: number
  total_answers: number
  created_at: string
}

export type Topic = {
  id: string
  user_id: string
  kami_no_ku: string
  kami_no_ku_reading: string | null
  description: string | null
  status: 'open' | 'closed'
  closes_at: string
  created_at: string
  profiles?: Profile
  answers_count?: number
}

export type Answer = {
  id: string
  topic_id: string
  user_id: string
  naka_no_ku: string
  naka_no_ku_reading: string | null
  shimo_no_ku: string
  shimo_no_ku_reading: string | null
  likes_count: number
  is_hidden: boolean
  report_count: number
  created_at: string
  profiles?: Profile
  user_has_liked?: boolean
}

export type Badge = {
  id: string
  name: string
  description: string
  icon: string
}

export type UserBadge = {
  badge_id: string
  earned_at: string
  badges: Badge
}
