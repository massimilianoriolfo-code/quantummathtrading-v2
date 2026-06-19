import { NextRequest, NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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
    const price = blackScholesPrice(type, s, k, t, r, mid)

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

function nearestExpirationToTarget(expirations: Date[], targetDays: number) {
  const today = new Date()
  const targetDate = new Date()

  targetDate.setDate(today.getDate() + targetDays)

  let nearestExpiration = expirations[0]
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

  return nearestExpiration
}

function dteFromExpiration(expiration: Date) {
  const today = new Date()
  const expirationDate = new Date(expiration)

  return Math.max(
    1,
    Math.round(
      (
        expirationDate.getTime() -
        today.getTime()
      ) /
      (1000 * 60 * 60 * 24)
    )
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

    const expiration30 =
      nearestExpirationToTarget(expirations, 30)

    const expiration180 =
      nearestExpirationToTarget(expirations, 180)

    const chain30 =
      await yahooFinance.options(
        ticker,
        {
          date: expiration30
        }
      )

    const optionChain30 =
      chain30.options?.[0]

    if (!optionChain30) {
      return NextResponse.json(
        { error: '30DTE option chain unavailable' },
        { status: 404 }
      )
    }

    const calls30: OptionContract[] =
      optionChain30.calls || []

    const puts30: OptionContract[] =
      optionChain30.puts || []

    if (!calls30.length || !puts30.length) {
      return NextResponse.json(
        { error: 'No 30DTE options found' },
        { status: 404 }
      )
    }

    const atmCall =
      nearestStrike(calls30, spot)

    const atmPut =
      nearestStrike(puts30, spot)

    const callPremium =
      getOptionPrice(atmCall)

    const putPremium =
      getOptionPrice(atmPut)

    const dte =
      dteFromExpiration(expiration30)

    const t =
      dte / 365

    const riskFreeRate =
      0.045

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
      nearestStrike(calls30, upperBoundary)

    const putLower =
      nearestStrike(puts30, lowerBoundary)

    const callUpperPremium =
      getOptionPrice(callUpper)

    const putLowerPremium =
      getOptionPrice(putLower)

    const chain180 =
      await yahooFinance.options(
        ticker,
        {
          date: expiration180
        }
      )

    const optionChain180 =
      chain180.options?.[0]

    if (!optionChain180) {
      return NextResponse.json(
        { error: '6-month option chain unavailable' },
        { status: 404 }
      )
    }

    const puts180: OptionContract[] =
      optionChain180.puts || []

    if (!puts180.length) {
      return NextResponse.json(
        { error: 'No 6-month puts found' },
        { status: 404 }
      )
    }

    const marriedPutTargetStrike =
      spot * 1.015

    const marriedPut =
      nearestStrike(
        puts180,
        marriedPutTargetStrike
      )

    const marriedPutPremium =
      getOptionPrice(marriedPut)

    const marriedPutDte =
      dteFromExpiration(expiration180)

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

    const marriedPutRisk =
      (
        spot -
        marriedPut.strike +
        marriedPutPremium
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
          expiration30,

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
          expiration30,

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
          marriedPut.strike,

        expiry:
          expiration180,

        premium:
          Number(
            marriedPutPremium.toFixed(2)
          ),

        maxProfit:
          'Unlimited',

        maxRisk:
          `${money(marriedPutRisk)} (${percent(marriedPutRisk, capital)})`,

        description:
          'Protective structure using a put slightly above ATM, with expiration of approximately 6 months or more.',

        note:
          `Structural hedge machine. Rule applied: strike about 1–2% above spot and longer-dated protection. DTE: ${marriedPutDte}.`
      },

      {
        name:
          'Machine 4: Covered Call Based',

        action:
          'SELL CALL + 100 SHARES',

        strike:
          callUpper.strike,

        expiry:
          expiration30,

        premium:
          Number(
            callUpperPremium.toFixed(2)
          ),

        maxProfit:
          `${money(coveredCallProfit)} (${percent(coveredCallProfit, capital)})`,

        maxRisk:
          'Stock ownership risk',

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
          expiration30,

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
          'Lower Cost Basis',

        description:
          'Combines short put and covered call structures.',

        note:
          'Cost basis reduction machine.'
      }
    ]

    const result = {
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
        expiration30,

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
        'ATM 30DTE IV recalculated from option premiums using Black-Scholes. Married Put uses a protective put about 1–2% above ATM with approximately 6 months or more to expiration.'
    }

    const { error: saveError } =
      await supabaseAdmin
        .from('simulations')
        .insert({
          clerk_user_id:
            userId,

          ticker:
            result.ticker,

          company:
            result.company,

          spot:
            result.spot,

          iv:
            result.iv,

          expiration:
            String(result.expiration),

          dte:
            result.dte,

          expected_move:
            result.expectedMove,

          lower_boundary:
            result.lowerBoundary,

          upper_boundary:
            result.upperBoundary,

          result:
            result
        })

    if (saveError) {
      console.error(
        'Supabase simulation save error:',
        saveError.message
      )
    }
    
    return NextResponse.json(result)

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