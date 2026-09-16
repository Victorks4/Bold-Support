/**
 * Cliente HTTP para workflows n8n.
 * URLs de produção: {base}/{path} ou {base}/{webhookId}/{path}
 * Copie a Production URL de cada workflow no n8n — formatos podem variar por rota.
 */

const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL ?? '/webhook'

function webhookPath(path: string, webhookId?: string): string {
  const normalized = path.replace(/^\//, '')
  return webhookId ? `${webhookId}/${normalized}` : normalized
}

export const webhookPaths = {
  postClientes: webhookPath('clientes'),
  getClientes: webhookPath('clientes'),
  getCliente: (id: string) => webhookPath(`clientes/id/${id}`),
  deleteCliente: (id: string) => webhookPath(`clientes/remover/${id}`, 'bold-delete-cliente'),
  postTickets: webhookPath('tickets/criar'),
  getTickets: webhookPath('tickets/listar'),
  // Esta instância registra GET por ID com webhookId no meio da URL (ver node Webhook no n8n).
  getTicket: (id: string) => webhookPath(`tickets/id/${id}`, 'bold-get-ticket-id'),
  deleteTicket: (id: string) => webhookPath(`tickets/remover/${id}`, 'bold-delete-ticket'),
  patchTicketStatus: (id: string) =>
    webhookPath(`tickets/atualizar-status/${id}`, 'bold-patch-ticket-status'),
  postInteracao: (id: string) =>
    webhookPath(`tickets/adicionar-interacao/${id}`, 'bold-post-ticket-interacao'),
} as const

export class ApiError extends Error {
  codigo: string
  status: number

  constructor(message: string, codigo: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.codigo = codigo
    this.status = status
  }
}

export function buildWebhookUrl(path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  return `${normalizedBase}/${normalizedPath}`
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const text = await response.text()
  let data: T & { erro?: string; codigo?: string; message?: string }
  try {
    data = text
      ? (JSON.parse(text) as T & { erro?: string; codigo?: string; message?: string })
      : ({} as T & { erro?: string; codigo?: string; message?: string })
  } catch {
    const trimmed = text.trim()
    const isHtml = /^<!DOCTYPE html|^<html/i.test(trimmed)
    const message = isHtml
      ? 'Erro interno no n8n. Reimporte o workflow e confira a Production URL.'
      : trimmed || 'Resposta inválida da API'
    throw new ApiError(message, 'RESPOSTA_INVALIDA', response.status)
  }

  if (!response.ok) {
    const body = data as { erro?: string; message?: string; codigo?: string }
    const erro = body.erro ?? body.message ?? 'Erro na requisição'
    const codigo = body.codigo ?? 'ERRO_DESCONHECIDO'
    throw new ApiError(erro, codigo, response.status)
  }

  return data as T
}
