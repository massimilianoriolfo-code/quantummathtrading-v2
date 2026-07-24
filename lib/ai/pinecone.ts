import 'server-only'

import { Pinecone } from '@pinecone-database/pinecone'
import { getRequiredServerEnvironmentVariable } from './env'

export const CRPM_BOOK_NAMESPACE = 'crpm-book-v1'

let pineconeClient: Pinecone | null = null

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: getRequiredServerEnvironmentVariable('PINECONE_API_KEY'),
    })
  }

  return pineconeClient
}

export function getCRPMKnowledgeIndex() {
  return getPineconeClient().index(
    getRequiredServerEnvironmentVariable('PINECONE_INDEX_HOST'),
  )
}
