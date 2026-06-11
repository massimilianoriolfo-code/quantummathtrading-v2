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
      className={`rounded-lg border border-[var(--crpm-border)] bg-gradient-to-br from-[var(--crpm-panel)] to-[var(--crpm-panel-2)] shadow-[0_0_30px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </section>
  )
}
