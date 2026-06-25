import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import CRPMAnalysisView, { SavedAnalysisData } from '@/components/crpm/CRPMAnalysisView'

function parseResult(raw: any) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  return raw
}

export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div className="p-6 text-sm">Unauthorized</div>

  const { data: simulation } = await supabaseAdmin
    .from('simulations')
    .select('*')
    .eq('id', id)
    .eq('clerk_user_id', userId)
    .single()

  if (!simulation) return <div className="p-6 text-sm">Simulation not found</div>

  const result = parseResult(simulation.result)

  const data: SavedAnalysisData = {
    ticker: String(result.ticker || simulation.ticker || '').toUpperCase(),
    company: result.company || simulation.company || simulation.ticker,
    spot: Number(result.spot ?? simulation.spot),
    iv: Number(result.iv ?? simulation.iv),
    expiration: String(result.expiration ?? simulation.expiration),
    dte: Number(result.dte ?? simulation.dte),
    expectedMove: Number(result.expectedMove ?? simulation.expected_move),
    lowerBoundary: Number(result.lowerBoundary ?? simulation.lower_boundary),
    upperBoundary: Number(result.upperBoundary ?? simulation.upper_boundary),
    atmCall: result.atmCall,
    atmPut: result.atmPut,
    machines: Array.isArray(result.machines) ? result.machines : [],
    method: result.method,
  }

  return <CRPMAnalysisView data={data} generatedAt={simulation.created_at} />
}
