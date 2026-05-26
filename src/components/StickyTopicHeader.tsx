'use client'

import { useEffect, useState } from 'react'

type Props = {
  kamiNoKu: string
  reading: string | null
  sentinelId: string
}

export default function StickyTopicHeader({ kamiNoKu, reading, sentinelId }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId)
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelId])

  return (
    <div className={`sticky top-14 z-40 transition-all duration-200
      ${visible
        ? 'opacity-100 translate-y-0 pointer-events-auto'
        : 'opacity-0 -translate-y-2 pointer-events-none'
      }
    `}>
      <div className="bg-white/95 backdrop-blur-sm border-b border-indigo-100 shadow-sm py-2.5 px-4 text-center -mx-4">
        <p className="text-sm font-bold text-indigo-800 tracking-widest">{kamiNoKu}</p>
        {reading && reading !== kamiNoKu && (
          <p className="text-xs text-gray-400 mt-0.5">（{reading}）</p>
        )}
      </div>
    </div>
  )
}
