import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
import { auth, currentUser } from '@clerk/nextjs/server'

const yahooFinance = new YahooFinance()

type OptionContract = {
  strike: number
  lastPrice?: number
  bid?: number
  ask?: number
}

function erf(x: number) {
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)

  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const t = 1 / (1 + p * x)

  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-x * x))

  return sign * y
}

function normalCdf(x: number) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

function blackScholesPrice(
  type: 'call' | 'put',
  s: number,
  k: number,
  t: number,
  r: number,
  sigma: number
) {
  if (t <= 0 || sigma <= 0) {
    return Math.max(type === 'call' ? s - k : k - s, 0)
  }

  const d1 =
    (Math.log(s / k) + (r + 0.5 * sigma * sigma) * t) /
    (sigma * Math.sqrt(t))

  const d2 = d1 - sigma * Math.sqrt(t)

  if (type === 'call') {
    return s * normalCdf(d1) - k * Math.exp(-r * t) * normalCdf(d2)
  }

  return k * Math.exp(-r * t) * normalCdf(-d2) - s * normalCdf(-d1)
}

function impliedVolatility(
  type: 'call' | 'put',
  marketPrice: number,
  s: number,
  k: number,
  t: number,
  r: number
) {
  let low = 0.0001
  let high = 5

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2

    const price = blackScholesPrice(
      type,
      s,
      k,
      t,
      r,
      mid
    )

    if (price > marketPrice) {
      high = mid
    } else {
      low = mid
    }
  }

  return ((low + high) / 2) * 100
}

function getOptionPrice(option: OptionContract) {
  const bid = option.bid || 0
  const ask = option.ask || 0

  if (bid > 0 && ask > 0) {
    return (bid + ask) / 2
  }

  return option.lastPrice || 0
}

function nearestStrike(options: OptionContract[], target: number) {
  return options.reduce((prev, curr) =>
    Math.abs(curr.strike - target) <
    Math.abs(prev.strike - target)
      ? curr
      : prev
  )
}

function money(value: number) {
  return `$${value.toFixed(2)}`
}

function percent(value: number, base: number) {
  return `${((value / base) * 100).toFixed(2)}%`
}

export async function GET(req: NextRequest) {
  try {
 const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await currentUser()

    if (user?.publicMetadata?.isPremium !== true) {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      )
    }

    const ticker =
      req.nextUrl.searchParams
        .get('ticker')
        ?.toUpperCase()

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker missing' },
        { status: 400 }
      )
    }

    const quote =
      await yahooFinance.quote(ticker)

    const spot =
      quote.regularMarketPrice ||
      quote.postMarketPrice ||
      quote.preMarketPrice ||
      quote.regularMarketPreviousClose

    if (!spot) {
      return NextResponse.json(
        { error: 'Invalid ticker' },
        { status: 404 }
      )
    }

    const firstChain =
      await yahooFinance.options(ticker)

    const expirations =
      firstChain.expirationDates

    if (!expirations?.length) {
      return NextResponse.json(
        { error: 'No expirations available' },
        { status: 404 }
      )
    }

    const today = new Date()

    const targetDate = new Date()

    targetDate.setDate(
      today.getDate() + 30
    )

    let nearestExpiration =
      expirations[0]

    let minDiff = Infinity

    for (const exp of expirations) {
      const expDate = new Date(exp)

      const diff = Math.abs(
        expDate.getTime() -
        targetDate.getTime()
      )

      if (diff < minDiff) {
        minDiff = diff
        nearestExpiration = exp
      }
    }

    const chain =
      await yahooFinance.options(
        ticker,
        {
          date: nearestExpiration
        }
      )

    const optionChain =
      chain.options?.[0]

    if (!optionChain) {
      return NextResponse.json(
        { error: 'Option chain unavailable' },
        { status: 404 }
      )
    }

    const calls: OptionContract[] =
      optionChain.calls || []

    const puts: OptionContract[] =
      optionChain.puts || []

    if (!calls.length || !puts.length) {
      return NextResponse.json(
        { error: 'No options found' },
        { status: 404 }
      )
    }

    const atmCall =
      nearestStrike(calls, spot)

    const atmPut =
      nearestStrike(puts, spot)

    const callPremium =
      getOptionPrice(atmCall)

    const putPremium =
      getOptionPrice(atmPut)

    const expirationDate =
      new Date(nearestExpiration)

    const dte = Math.max(
      1,
      Math.round(
        (
          expirationDate.getTime() -
          today.getTime()
        ) /
        (1000 * 60 * 60 * 24)
      )
    )

    const t = dte / 365

    const riskFreeRate = 0.045

    const callIV =
      impliedVolatility(
        'call',
        callPremium,
        spot,
        atmCall.strike,
        t,
        riskFreeRate
      )

    const putIV =
      impliedVolatility(
        'put',
        putPremium,
        spot,
        atmPut.strike,
        t,
        riskFreeRate
      )

    const iv =
      (callIV + putIV) / 2

    const ivDecimal =
      iv / 100

    const expectedMove =
      spot *
      ivDecimal *
      Math.sqrt(dte / 365)

    const upperBoundary =
      spot + expectedMove

    const lowerBoundary =
      spot - expectedMove

    const callUpper =
      nearestStrike(calls, upperBoundary)

    const putLower =
      nearestStrike(puts, lowerBoundary)

    const callUpperPremium =
      getOptionPrice(callUpper)

    const putLowerPremium =
      getOptionPrice(putLower)

    const capital =
      spot * 100

    const coveredCallProfit =
      (
        callUpper.strike -
        spot +
        callUpperPremium
      ) * 100

    const shortPutRisk =
      (
        putLower.strike -
        putLowerPremium
      ) * 100

    const machines = [
      {
        name:
          'Machine 1: Long Call Based',

        action:
          'BUY CALL',

        strike:
          callUpper.strike,

        expiry:
          nearestExpiration,

        premium:
          Number(
            callUpperPremium.toFixed(2)
          ),

        maxProfit:
          'Unlimited',

        maxRisk:
          `${money(callUpperPremium * 100)} (${percent(callUpperPremium * 100, capital)})`,

        description:
          'Capitalizes on upside movement beyond the upper 1-sigma boundary.',

        note:
          'Directional bullish machine.'
      },

      {
        name:
          'Machine 2: Short Put Based',

        action:
          'SELL PUT',

        strike:
          putLower.strike,

        expiry:
          nearestExpiration,

        premium:
          Number(
            putLowerPremium.toFixed(2)
          ),

        maxProfit:
          `${money(putLowerPremium * 100)} (${percent(putLowerPremium * 100, capital)})`,

        maxRisk:
          `${money(shortPutRisk)} (${percent(shortPutRisk, capital)})`,

        description:
          'Harvests volatility near the lower 1-sigma boundary.',

        note:
          'Income generation machine.'
      },

      {
        name:
          'Machine 3: Married Put Based',

        action:
          'BUY PUT + 100 SHARES',

        strike:
          putLower.strike,

        expiry:
          nearestExpiration,

        premium:
          Number(
            putLowerPremium.toFixed(2)
          ),

        maxProfit:
          'Unlimited',

        maxRisk:
          `${money((spot - putLower.strike + putLowerPremium) * 100)} (${percent((spot - putLower.strike + putLowerPremium) * 100, capital)})`,

        description:
          'Protective structure for stock ownership.',

        note:
          'Structural hedge machine.'
      },

      {
        name:
          'Machine 4: Covered Call Based',

        action:
          'SELL CALL + 100 SHARES',

        strike:
          callUpper.strike,

        expiry:
          nearestExpiration,

        premium:
          Number(
            callUpperPremium.toFixed(2)
          ),

        maxProfit:
          `${money(coveredCallProfit)} (${percent(coveredCallProfit, capital)})`,

        maxRisk:
          'Finite stock ownership risk',

        description:
          'Generates yield on owned shares.',

        note:
          'Yield enhancement machine.'
      },

      {
        name:
          'Machine 5: Assigned Short Put + Covered Call',

        action:
          'COMBINED PUT & CALL',

        strike:
          `${putLower.strike} / ${callUpper.strike}`,

        expiry:
          nearestExpiration,

        premium:
          Number(
            (
              putLowerPremium +
              callUpperPremium
            ).toFixed(2)
          ),

        maxProfit:
          'Enhanced Yield',

        maxRisk:
          'Reduced Cost Basis',

        description:
          'Combines short put and covered call structures.',

        note:
          'Cost basis reduction machine.'
      }
    ]

    return NextResponse.json({

      ticker,

      company:
        quote.longName ||
        quote.shortName ||
        ticker,

      spot:
        Number(
          spot.toFixed(2)
        ),

      iv:
        Number(
          iv.toFixed(2)
        ),

      expiration:
        nearestExpiration,

      dte,

      capital:
        Number(
          capital.toFixed(2)
        ),

      expectedMove:
        Number(
          expectedMove.toFixed(2)
        ),

      upperBoundary:
        Number(
          upperBoundary.toFixed(2)
        ),

      lowerBoundary:
        Number(
          lowerBoundary.toFixed(2)
        ),

      atmCall: {
        strike:
          atmCall.strike,

        premium:
          Number(
            callPremium.toFixed(2)
          ),

        iv:
          Number(
            callIV.toFixed(2)
          )
      },

      atmPut: {
        strike:
          atmPut.strike,

        premium:
          Number(
            putPremium.toFixed(2)
          ),

        iv:
          Number(
            putIV.toFixed(2)
          )
      },

      machines,

      method:
        'ATM 30DTE IV recalculated from option premiums using Black-Scholes.'
    })

  } catch (error: any) {

    return NextResponse.json(
      {
        error:
          'Simulator error',

        details:
          error.message
      },
      { status: 500 }
    )
  }
}