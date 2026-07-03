import { NextResponse } from 'next/server'

type YahooQuote = {
  symbol?: string
  shortname?: string
  longname?: string
  exchDisp?: string
  exchange?: string
  quoteType?: string
}

function isIsin(query: string) {
  return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(query.trim().toUpperCase())
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  const query = q.toUpperCase()
  const searchQuery = isIsin(query) ? query : q

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      searchQuery
    )}&quotesCount=10&newsCount=0`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Symbol search unavailable' },
        { status: 500 }
      )
    }

    const data = await response.json()

    const results =
      data.quotes
        ?.filter((quote: YahooQuote) => {
          return (
            quote.symbol &&
            quote.quoteType === 'EQUITY'
          )
        })
        .map((quote: YahooQuote) => ({
          ticker: quote.symbol,
          company:
            quote.longname ||
            quote.shortname ||
            quote.symbol,
          exchange:
            quote.exchDisp ||
            quote.exchange ||
            '',
          isin: isIsin(query) ? query : null,
        })) || []

    return NextResponse.json(results)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Unable to search symbol' },
      { status: 500 }
    )
  }
}