'use client'

import { useRef, useState } from 'react'

type Props = {
  text: string
}

type Position = {
  top: number
  left: number
}

function normalizeTooltipText(text: string) {
  const lower = text.toLowerCase()

  return lower
    .split('. ')
    .map((sentence) => {
      if (!sentence) return sentence
      return sentence.charAt(0).toUpperCase() + sentence.slice(1)
    })
    .join('. ')
}

export default function InfoTooltip({ text }: Props) {
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })

  function showTooltip() {
    const rect = iconRef.current?.getBoundingClientRect()
    if (!rect) return

    const tooltipWidth = 260
    const estimatedTooltipHeight = 74
    const margin = 16
    const gap = 8

    let left = rect.left + rect.width / 2
    left = Math.max(margin + tooltipWidth / 2, left)
    left = Math.min(window.innerWidth - margin - tooltipWidth / 2, left)

    let top = rect.bottom + gap

    if (top + estimatedTooltipHeight > window.innerHeight - margin) {
      top = rect.top - estimatedTooltipHeight - gap
    }

    top = Math.max(margin, top)

    setPosition({ top, left })
    setVisible(true)
  }

  return (
    <>
      <span
        ref={iconRef}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setVisible(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-400 bg-white text-[10px] font-semibold leading-none text-zinc-500"
      >
        i
      </span>

      {visible && (
        <span
          className="pointer-events-none fixed z-[99999] w-[260px] max-w-[calc(100vw-32px)] -translate-x-1/2 whitespace-normal break-words rounded-md border border-zinc-200 bg-white px-3 py-2 text-left text-[12px] font-normal leading-relaxed tracking-normal text-zinc-700 shadow-xl normal-case"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {normalizeTooltipText(text)}
        </span>
      )}
    </>
  )
}
