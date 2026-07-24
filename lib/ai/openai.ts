import 'server-only'

import OpenAI from 'openai'
import { getRequiredServerEnvironmentVariable } from './env'

let openAIClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openAIClient) {
    openAIClient = new OpenAI({
      apiKey: getRequiredServerEnvironmentVariable('OPENAI_API_KEY'),
    })
  }

  return openAIClient
}
