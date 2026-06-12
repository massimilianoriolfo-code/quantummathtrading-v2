import Link from 'next/link'

type CRPMButtonProps = {
  children: React.ReactNode
  href?: string
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  onClick?: () => void
}

const variants = {
  primary:
    'border-[var(--crpm-blue)] bg-[var(--crpm-blue)]/10 text-[var(--crpm-blue)] hover:bg-[var(--crpm-blue)] hover:text-white',
  secondary:
    'border-[var(--crpm-border)] bg-[var(--crpm-soft)] text-[var(--crpm-heading)] hover:border-[var(--crpm-blue)] hover:text-[var(--crpm-blue)]',
  danger:
    'border-[var(--crpm-red)] bg-[var(--crpm-red)]/10 text-[var(--crpm-red)] hover:bg-[var(--crpm-red)] hover:text-white',
}

export default function CRPMButton({
  children,
  href,
  type = 'button',
  variant = 'secondary',
  className = '',
  onClick,
}: CRPMButtonProps) {
  const classes = `inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-[11px] font-bold shadow-sm transition ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
