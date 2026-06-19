'use client'

import type { ReactNode } from 'react'

type Variant = 'neutral' | 'danger' | 'primary'

type Props = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
  variant?: Variant
  type?: 'button' | 'submit'
}

export default function CRPMActionButton({
  children,
  onClick,
  disabled = false,
  title,
  variant = 'neutral',
  type = 'button',
}: Props) {
  const variantClass =
    variant === 'danger'
      ? 'text-red-300 hover:border-red-300 hover:bg-red-50'
      : variant === 'primary'
        ? 'text-blue-700 hover:border-blue-300 hover:bg-blue-50'
        : 'text-slate-500 hover:border-slate-300 hover:bg-slate-50'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white/60 shadow-none transition hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variantClass}`}
    >
      {children}
    </button>
  )
}
