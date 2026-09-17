/**
 * Importa/atualiza workflows Bold Support no n8n via API.
 *
 * - Atualiza workflow existente (PUT) em vez de apagar e recriar
 * - Preserva credencial Postgres dos nodes ja configurados
 * - Remove duplicatas com o mesmo nome antes de importar
 *
 * 1. n8n → Settings → API → Create API key
 * 2. cp .env.railway.example .env.railway
 * 3. npm run n8n:import
 *
 * Opcional: N8N_POSTGRES_CREDENTIAL_ID=id-da-credencial (se a API nao listar credentials)
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const workflowsDir = join(rootDir, 'n8n', 'workflows')

const WORKFLOW_ORDER = [
  'POST_Auth_Login.json',
  'POST_Clientes.json',
  'GET_Clientes.json',
  'GET_Cliente_por_ID.json',
  'DELETE_Cliente_por_ID.json',
  'POST_Tickets.json',
  'GET_Tickets.json',
  'GET_Ticket_por_ID.json',
  'DELETE_Ticket_por_ID.json',
  'PATCH_Ticket_Status.json',
  'POST_Ticket_Interacao.json',
]

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
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile(join(rootDir, '.env.railway'))

const baseUrl = (process.env.N8N_BASE_URL ?? 'https://bold-support-production.up.railway.app').replace(
  /\/$/,
  '',
)
const apiKey = process.env.N8N_API_KEY
const credentialName = (process.env.N8N_POSTGRES_CREDENTIAL_NAME ?? 'Bold Support - Supabase').trim()
const credentialIdFromEnv = process.env.N8N_POSTGRES_CREDENTIAL_ID?.trim()

if (!apiKey) {
  console.error('Defina N8N_API_KEY em .env.railway (veja .env.railway.example)')
  process.exit(1)
}

async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': apiKey,
      ...options.headers,
    },
  })
  const text = await response.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: text }
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${path}: ${data?.message ?? text}`)
  }
  return data
}

function prepareWorkflowPayload(exportJson) {
  const { name, nodes, connections, settings } = exportJson
  return {
    name,
    nodes: nodes.map((node) => {
      const cleaned = { ...node }
      delete cleaned.credentials
      return cleaned
    }),
    connections,
    settings: settings ?? {},
  }
}

function postgresCredentialMapFromNodes(nodes) {
  const map = new Map()
  for (const node of nodes ?? []) {
    if (node.type === 'n8n-nodes-base.postgres' && node.credentials?.postgres?.id) {
      map.set(node.name, node.credentials.postgres)
    }
  }
  return map
}

function attachPostgresCredentials(nodes, credentialMap, fallbackCredential) {
  return nodes.map((node) => {
    if (node.type !== 'n8n-nodes-base.postgres') return node

    const cred = credentialMap.get(node.name) ?? fallbackCredential
    if (!cred?.id) return node

    return {
      ...node,
      credentials: {
        postgres: {
          id: cred.id,
          name: cred.name,
        },
      },
    }
  })
}

async function listAllWorkflows() {
  const result = await api('/workflows?limit=250')
  return Array.isArray(result) ? result : result?.data ?? []
}

async function getWorkflow(id) {
  return api(`/workflows/${id}`)
}

async function findPostgresCredentialFallback() {
  if (credentialIdFromEnv) {
    return { id: credentialIdFromEnv, name: credentialName }
  }

  try {
    const result = await api('/credentials?includeData=false')
    const list = Array.isArray(result) ? result : result?.data ?? []
    const match = list.find((c) => c.name === credentialName && c.type === 'postgres')
    if (match) return { id: match.id, name: match.name }
    console.warn(`Credencial "${credentialName}" nao encontrada via API.`)
  } catch (err) {
    console.warn(`API de credentials indisponivel (${err.message}).`)
  }

  console.warn(
    'Dica: defina N8N_POSTGRES_CREDENTIAL_ID no .env.railway (id da credencial no n8n).',
  )
  return null
}

async function removeDuplicateWorkflows(allWorkflows) {
  const byName = new Map()
  for (const wf of allWorkflows) {
    if (!wf?.name || !wf?.id) continue
    const group = byName.get(wf.name) ?? []
    group.push(wf)
    byName.set(wf.name, group)
  }

  let removed = 0
  for (const [name, group] of byName) {
    if (group.length <= 1) continue

    const sorted = [...group].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1
      return String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? ''))
    })
    const [keep, ...duplicates] = sorted

    for (const dup of duplicates) {
      await api(`/workflows/${dup.id}`, { method: 'DELETE' })
      console.log(`  duplicata removida: "${name}" (id ${dup.id}) — mantido ${keep.id}`)
      removed += 1
    }
  }

  if (removed > 0) {
    console.log(`Duplicatas removidas: ${removed}`)
  }

  return listAllWorkflows()
}

async function upsertWorkflow(payload, existingWorkflow, credentialMap, fallbackCredential) {
  payload.nodes = attachPostgresCredentials(payload.nodes, credentialMap, fallbackCredential)

  if (existingWorkflow?.id) {
    const updated = await api(`/workflows/${existingWorkflow.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    const id = updated.id ?? existingWorkflow.id
    if (!existingWorkflow.active) {
      await api(`/workflows/${id}/activate`, { method: 'POST' })
    }
    console.log(`  atualizado: ${payload.name} (id ${id})`)
    return id
  }

  const created = await api('/workflows', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const id = created.id
  await api(`/workflows/${id}/activate`, { method: 'POST' })
  console.log(`  criado: ${payload.name} (id ${id})`)
  return id
}

async function importWorkflow(fileName, workflowsByName, fallbackCredential) {
  const filePath = join(workflowsDir, fileName)
  const raw = JSON.parse(readFileSync(filePath, 'utf8'))
  const payload = prepareWorkflowPayload(raw)

  const existing = workflowsByName.get(payload.name)
  let credentialMap = new Map()

  if (existing?.id) {
    try {
      const full = await getWorkflow(existing.id)
      credentialMap = postgresCredentialMapFromNodes(full.nodes)
    } catch {
      // segue sem mapa — usa fallback se houver
    }
  }

  const postgresCount = payload.nodes.filter((n) => n.type === 'n8n-nodes-base.postgres').length

  const id = await upsertWorkflow(payload, existing, credentialMap, fallbackCredential)

  const finalAttached = payload.nodes.filter((n) => n.credentials?.postgres).length

  if (postgresCount > 0 && finalAttached === 0) {
    console.warn(`  aviso: ${payload.name} — vincule Postgres manualmente (${postgresCount} node(s))`)
  } else if (postgresCount > 0) {
    console.log(`  postgres: ${finalAttached}/${postgresCount} node(s) com credencial`)
  }

  return id
}

async function main() {
  console.log(`n8n: ${baseUrl}`)

  const fallbackCredential = await findPostgresCredentialFallback()
  if (fallbackCredential) {
    console.log(`Fallback Postgres: ${fallbackCredential.name} (${fallbackCredential.id})`)
  }

  console.log('Verificando duplicatas...')
  let allWorkflows = await listAllWorkflows()
  allWorkflows = await removeDuplicateWorkflows(allWorkflows)

  const workflowsByName = new Map()
  for (const wf of allWorkflows) {
    if (wf?.name) workflowsByName.set(wf.name, wf)
  }

  for (const file of WORKFLOW_ORDER) {
    console.log(`Importando ${file}...`)
    const id = await importWorkflow(file, workflowsByName, fallbackCredential)
    const wf = await getWorkflow(id)
    workflowsByName.set(wf.name, wf)
  }

  console.log('\nConcluido. Proximo passo: npm run test:api (com API_BASE_URL no .env.test)')
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
