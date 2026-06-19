import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function CRPMActionGroup({ children }: Props) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm divide-x divide-slate-200">
      {children}
    </div>
  )
}
