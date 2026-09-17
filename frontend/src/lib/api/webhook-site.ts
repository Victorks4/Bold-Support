import type { WebhookEventoTipo, WebhookExternoPayload } from '@/lib/types/evento'

type WebhookSiteRequest = {
  uuid: string
  created_at: string
  content: string
}

type WebhookSiteListResponse = {
  data?: WebhookSiteRequest[]
}

const EVENTOS_VALIDOS: WebhookEventoTipo[] = [
  'status_alterado',
  'interacao_adicionada',
  'ticket_excluido',
]

export type WebhookSiteEvento = {
  id: string
  criado_em: string
  payload: WebhookExternoPayload
}

function parsePayload(content: string): WebhookExternoPayload | null {
  try {
    const raw = JSON.parse(content) as Partial<WebhookExternoPayload>
    if (!raw.protocolo || !raw.evento || !raw.status) return null
    if (!EVENTOS_VALIDOS.includes(raw.evento as WebhookEventoTipo)) return null
    return {
      protocolo: String(raw.protocolo),
      evento: raw.evento as WebhookEventoTipo,
      status: String(raw.status),
    }
  } catch {
    return null
  }
}

/** Extrai UUID do token puro ou de URL copiada do webhook.site. */
export function normalizeWebhookSiteToken(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )
  return match?.[0] ?? trimmed
}

/** Busca requisições recebidas no webhook.site (via proxy Vite em dev). */
export async function fetchWebhookSiteEvents(token: string): Promise<WebhookSiteEvento[]> {
  const normalized = normalizeWebhookSiteToken(token)
  if (!normalized) return []

  const base =
    import.meta.env.VITE_WEBHOOK_SITE_PROXY ??
    (import.meta.env.PROD ? 'https://webhook.site' : '/webhook-site-api')
  const url = `${base.replace(/\/$/, '')}/token/${normalized}/requests?sorting=newest&per_page=30`

  const response = await fetch(url)
  if (!response.ok) return []

  const body = (await response.json()) as WebhookSiteListResponse
  const rows = body.data ?? []

  const eventos: WebhookSiteEvento[] = []
  for (const row of rows) {
    const payload = parsePayload(row.content)
    if (!payload) continue
    eventos.push({
      id: row.uuid,
      criado_em: row.created_at,
      payload,
    })
  }

  return eventos
}
