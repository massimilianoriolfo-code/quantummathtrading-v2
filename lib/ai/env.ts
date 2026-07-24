const requiredServerEnvironmentVariables = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX_HOST',
] as const

type RequiredServerEnvironmentVariable =
  (typeof requiredServerEnvironmentVariables)[number]

export function getRequiredServerEnvironmentVariable(
  name: RequiredServerEnvironmentVariable,
): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`)
  }

  return value
}
