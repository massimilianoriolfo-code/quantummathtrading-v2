import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  DEFAULT_CRPM_KNOWLEDGE_LIMIT,
  searchCRPMKnowledge,
} from '@/lib/ai/knowledge'

export const runtime = 'nodejs'

const MAX_QUESTION_LENGTH = 2_000

type SearchRequestBody = {
  question?: unknown
  limit?: unknown
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function normalizeQuestion(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const question = value.trim()

  if (!question || question.length > MAX_QUESTION_LENGTH) return null

  return question
}

function normalizeLimit(value: unknown): number | undefined | null {
  if (value === undefined) return undefined
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  return value
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return jsonError('Unauthorized.', 401)
  }

  let body: SearchRequestBody

  try {
    body = (await request.json()) as SearchRequestBody
  } catch {
    return jsonError('Request body must be valid JSON.', 400)
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('Request body must be a JSON object.', 400)
  }

  const question = normalizeQuestion(body.question)

  if (!question) {
    return jsonError(
      `Question must be a non-empty string of at most ${MAX_QUESTION_LENGTH} characters.`,
      400,
    )
  }

  const limit = normalizeLimit(body.limit)

  if (limit === null) {
    return jsonError('Limit must be an integer.', 400)
  }

  try {
    const matches = await searchCRPMKnowledge(question, limit)

    return NextResponse.json({
      question,
      limit: limit ?? DEFAULT_CRPM_KNOWLEDGE_LIMIT,
      count: matches.length,
      matches,
    })
  } catch (error) {
    console.error('CRPM Assistant knowledge search failed:', error)

    if (
      error instanceof Error &&
      (error.message.includes('result limit must be an integer') ||
        error.message.includes('non-empty CRPM knowledge question'))
    ) {
      return jsonError(error.message, 400)
    }

    return jsonError('Unable to search the CRPM knowledge base.', 500)
  }
}
