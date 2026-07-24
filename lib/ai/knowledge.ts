import 'server-only'

import type { RecordMetadata } from '@pinecone-database/pinecone'
import { getOpenAIClient } from './openai'
import {
  CRPM_BOOK_NAMESPACE,
  getCRPMKnowledgeIndex,
} from './pinecone'

export const CRPM_EMBEDDING_MODEL = 'text-embedding-3-small'
export const DEFAULT_CRPM_KNOWLEDGE_LIMIT = 5
export const MAX_CRPM_KNOWLEDGE_LIMIT = 10

type CRPMKnowledgeMetadata = RecordMetadata & {
  author?: string
  language?: string
  page?: number
  section?: string
  source?: string
  text?: string
}

export type CRPMKnowledgeResult = {
  id: string
  score: number
  text: string
  page: number | null
  section: string | null
  source: string | null
  author: string | null
  language: string | null
}

function normalizeQuestion(question: string): string {
  const normalized = question.trim()

  if (!normalized) {
    throw new Error('A non-empty CRPM knowledge question is required.')
  }

  return normalized
}

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return DEFAULT_CRPM_KNOWLEDGE_LIMIT
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_CRPM_KNOWLEDGE_LIMIT) {
    throw new Error(
      `CRPM knowledge result limit must be an integer between 1 and ${MAX_CRPM_KNOWLEDGE_LIMIT}.`,
    )
  }

  return limit
}

export async function searchCRPMKnowledge(
  question: string,
  limit?: number,
): Promise<CRPMKnowledgeResult[]> {
  const normalizedQuestion = normalizeQuestion(question)
  const normalizedLimit = normalizeLimit(limit)

  const embeddingResponse = await getOpenAIClient().embeddings.create({
    model: CRPM_EMBEDDING_MODEL,
    input: normalizedQuestion,
    encoding_format: 'float',
  })

  const embedding = embeddingResponse.data[0]?.embedding

  if (!embedding?.length) {
    throw new Error('OpenAI returned an empty embedding for the CRPM question.')
  }

  const queryResponse = await getCRPMKnowledgeIndex()
    .namespace(CRPM_BOOK_NAMESPACE)
    .query({
      vector: embedding,
      topK: normalizedLimit,
      includeMetadata: true,
      includeValues: false,
    })

  return (queryResponse.matches ?? []).flatMap((match) => {
    const metadata = (match.metadata ?? {}) as CRPMKnowledgeMetadata
    const text = typeof metadata.text === 'string' ? metadata.text.trim() : ''

    if (!text) {
      return []
    }

    return [
      {
        id: match.id,
        score: typeof match.score === 'number' ? match.score : 0,
        text,
        page: typeof metadata.page === 'number' ? metadata.page : null,
        section:
          typeof metadata.section === 'string' ? metadata.section : null,
        source: typeof metadata.source === 'string' ? metadata.source : null,
        author: typeof metadata.author === 'string' ? metadata.author : null,
        language:
          typeof metadata.language === 'string' ? metadata.language : null,
      },
    ]
  })
}
