'use client'

import { useState } from 'react'

type CRPMLogoProps = {
  ticker: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const frameSizes = {
  xs: 'h-5 w-5',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

const imageSizes = {
  xs: 'h-5 w-5',
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

export default function CRPMLogo({
  ticker,
  size = 'sm',
}: CRPMLogoProps) {
  const cleanTicker = String(ticker || '').toUpperCase()
  const [fallback, setFallback] = useState(false)
  const logoUrl = `https://assets.parqet.com/logos/symbol/${cleanTicker}`

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden ${frameSizes[size]}`}>
      {!fallback ? (
        <img
          src={logoUrl}
          alt={`${cleanTicker} logo`}
          className={`object-contain ${imageSizes[size]}`}
          onError={() => setFallback(true)}
        />
      ) : (
        <span className="text-[10px] font-black text-[var(--crpm-heading)]">
          {cleanTicker.slice(0, 1)}
        </span>
      )}
    </div>
  )
}
