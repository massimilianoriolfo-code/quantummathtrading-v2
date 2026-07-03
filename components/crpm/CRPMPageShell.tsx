import CRPMHeader, { ActiveNav } from '@/components/crpm/CRPMHeader'

export default function CRPMPageShell({
  active,
  title,
  subtitle,
  children,
}: {
  active: ActiveNav
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-zinc-50 p-4 text-[#0b1220]">
      <div className="mx-auto mt-8 w-full overflow-visible rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3">
          <CRPMHeader active={active} title={title} subtitle={subtitle} />
          <div className="min-h-0 flex-1 overflow-visible">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
