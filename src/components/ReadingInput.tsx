'use client'

type Props = {
  name: string
  value: string
  onChange: (v: string) => void
  min: number
  max: number
  placeholder?: string
}

const isAllHiragana = (text: string) => /^[぀-ゟー]*$/.test(text)

export default function ReadingInput({ name, value, onChange, min, max, placeholder }: Props) {
  const len = value.length
  const isHiragana = isAllHiragana(value)
  const isValid = isHiragana && len >= min && len <= max

  return (
    <div>
      <input
        name={name}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'ひらがなで入力'}
        maxLength={max + 3}
        className={`w-full border rounded-xl px-4 py-2 text-center tracking-widest text-sm focus:outline-none transition-colors
          ${!isHiragana && value.length > 0
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 focus:border-indigo-300'
          }`}
      />
      <div className={`flex justify-between text-xs mt-0.5 px-1
        ${isValid ? 'text-emerald-500' : value.length > 0 ? 'text-red-400' : 'text-gray-300'}`}
      >
        <span>{!isHiragana && value.length > 0 ? 'ひらがなで入力してください' : `${min}〜${max}文字`}</span>
        <span>{len}文字 {isValid ? '✓' : ''}</span>
      </div>
    </div>
  )
}
