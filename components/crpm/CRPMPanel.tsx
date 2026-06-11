type CRPMPanelProps = {
  children: React.ReactNode
  className?: string
}

export default function CRPMPanel({
  children,
  className = '',
}: CRPMPanelProps) {
  return (
    <section
      className={`rounded-lg border border-zinc-800 bg-gradient-to-br from-[#12171d] to-[#0d1116] shadow-[0_0_30px_rgba(0,0,0,0.30)] ${className}`}
    >
      {children}
    </section>
  )
}
