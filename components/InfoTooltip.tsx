'use client'

type Props = {
  text: string
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
  return (
    <span className="group relative ml-1 inline-flex items-center align-middle normal-case">
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-400 bg-white text-[10px] font-semibold leading-none text-zinc-500 normal-case">
        i
      </span>

      <span className="pointer-events-none absolute left-1/2 top-5 z-50 hidden w-72 -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-left text-[13px] font-normal leading-relaxed tracking-normal text-zinc-700 shadow-md normal-case group-hover:block">
        {normalizeTooltipText(text)}
      </span>
    </span>
  )
}
