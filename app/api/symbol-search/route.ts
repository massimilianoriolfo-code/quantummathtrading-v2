import { NextRequest, NextResponse } from 'next/server'

type YahooQuote = {
  symbol?: string
  shortname?: string
  longname?: string
  quoteType?: string
  exchDisp?: string
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const query =
      searchParams.get('q')?.trim() || ''

    if (query.length < 2) {
      return NextResponse.json([])
    }

    const response = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        query
      )}&quotesCount=8&newsCount=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Symbol search failed' },
        { status: 500 }
      )
    }

    const data = await response.json()

    const results =
      (data.quotes || [])
        .filter((item: YahooQuote) => {
  return (
    item.symbol &&
    (item.longname || item.shortname) &&
    ['EQUITY', 'ETF', 'MUTUALFUND', 'INDEX'].includes(item.quoteType || '')
  )
})
.sort((a: YahooQuote, b: YahooQuote) => {
  const q = query.toUpperCase()

  if (a.symbol?.toUpperCase() === q) return -1
  if (b.symbol?.toUpperCase() === q) return 1

  return 0
})
        .map((item: YahooQuote) => ({
          ticker: item.symbol,
          company: item.longname || item.shortname,
          exchange: item.exchDisp || '',
        }))
        .slice(0, 8)

    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Symbol search error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}