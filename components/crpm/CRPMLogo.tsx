const domains: Record<string, string> = {
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  NFLX: 'netflix.com',
  NVDA: 'nvidia.com',
  SPY: 'ssga.com',
  BLK: 'blackrock.com',
  AMZN: 'amazon.com',
  GOOGL: 'abc.xyz',
  GOOG: 'abc.xyz',
  META: 'meta.com',
  TSLA: 'tesla.com',
  AVGO: 'broadcom.com',
  AMD: 'amd.com',
  JPM: 'jpmorganchase.com',
  V: 'visa.com',
  MA: 'mastercard.com',
  UNH: 'unitedhealthgroup.com',
  XOM: 'exxonmobil.com',
  COST: 'costco.com',
  LLY: 'lilly.com',
  WMT: 'walmart.com',
  HD: 'homedepot.com',
  PG: 'pg.com',
  KO: 'coca-cola.com',
  PEP: 'pepsico.com',
  MCD: 'mcdonalds.com',
  CRM: 'salesforce.com',
  ORCL: 'oracle.com',
  CSCO: 'cisco.com',
  BAC: 'bankofamerica.com',
  DIS: 'disney.com',
  NKE: 'nike.com',
  IBM: 'ibm.com',
}

type CRPMLogoProps = {
  ticker: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
}

const imageSizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
}

export default function CRPMLogo({
  ticker,
  size = 'lg',
}: CRPMLogoProps) {
  const cleanTicker = String(ticker || '').toUpperCase()
  const domain = domains[cleanTicker]
  const src = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-white ${sizes[size]}`}
    >
      {src ? (
        <img
          src={src}
          alt={`${cleanTicker} logo`}
          className={`object-contain ${imageSizes[size]}`}
        />
      ) : (
        <span className="text-sm font-black text-zinc-900">
          {cleanTicker.slice(0, 2)}
        </span>
      )}
    </div>
  )
}
