'use client'

import type { ReactNode } from 'react'

type Variant = 'neutral' | 'danger' | 'primary'

type Props = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: Variant
  type?: 'button' | 'submit'
  grouped?: boolean
}

export default function CRPMActionButton({
  children,
  onClick,
  disabled = false,
  variant = 'neutral',
  type = 'button',
  grouped = false,
}: Props) {
  const variantClass =
    variant === 'danger'
      ? 'text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
      : variant === 'primary'
        ? 'text-blue-700 hover:border-blue-300 hover:bg-blue-50'
        : 'text-slate-500 hover:border-slate-300 hover:bg-slate-50'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-300 bg-white opacity-85 shadow-none transition hover:border-slate-200 hover:bg-white/70 hover:opacity-100 hover:shadow-sm active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variantClass}`}
    >
      {children}
    </button>
  )
}
