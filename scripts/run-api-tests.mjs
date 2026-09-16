import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import newman from 'newman'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const postmanDir = join(rootDir, 'postman')

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return

  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile(join(rootDir, '.env.test'))

const baseUrl = process.env.API_BASE_URL ?? 'https://dev.boldsolution.com.br/webhook'
const agentEmail = process.env.TEST_AGENT_EMAIL ?? 'agente@bold.com'
const agentPassword = process.env.TEST_AGENT_PASSWORD ?? 'Bold@2026'

const envVars = [
  { key: 'base_url', value: baseUrl },
  { key: 'test_agent_email', value: agentEmail },
  { key: 'test_agent_password', value: agentPassword },
]

const collections = [
  'Bold-Support-Etapa-4.postman_collection.json',
  'Bold-Support-Etapa-1.postman_collection.json',
  'Bold-Support-Etapa-2.postman_collection.json',
]

function runCollection(collectionFile) {
  return new Promise((resolve, reject) => {
    newman.run(
      {
        collection: join(postmanDir, collectionFile),
        environment: join(postmanDir, 'Bold-Support.postman_environment.json'),
        envVar: envVars,
        reporters: ['cli'],
        insecure: true,
        timeout: 60000,
        timeoutRequest: 30000,
      },
      (err, summary) => {
        if (err) {
          reject(err)
          return
        }

        const failed = summary.run.failures.length
        const name = summary.collection.name ?? collectionFile
        console.log(`\n${name}: ${failed === 0 ? 'OK' : `${failed} falha(s)`}`)

        if (failed > 0) {
          reject(new Error(`${name} falhou com ${failed} assertion(s).`))
          return
        }

        for (const key of ['access_token', 'cliente_id', 'ticket_id']) {
          const entry = summary.environment?.values?.members?.find((item) => item.key === key)
          if (!entry?.value) continue
          const existing = envVars.find((item) => item.key === key)
          if (existing) existing.value = entry.value
          else envVars.push({ key, value: entry.value })
        }

        resolve(summary)
      },
    )
  })
}

async function main() {
  console.log(`API base: ${baseUrl}`)
  console.log(`Agente: ${agentEmail}`)

  for (const collection of collections) {
    await runCollection(collection)
  }

  console.log('\nTodos os testes de API passaram.')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
