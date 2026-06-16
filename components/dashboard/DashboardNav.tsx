import CRPMAppNav from '@/components/crpm/CRPMAppNav'

type Props = {
  active: 'dashboard' | 'portfolio' | 'watchlist' | 'simulator'
}

export default function DashboardNav({ active }: Props) {
  return <CRPMAppNav active={active} className="mt-4 justify-start" />
}
