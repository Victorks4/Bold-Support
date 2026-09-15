/**
 * Cliente HTTP para workflows n8n.
 * URLs de produção: {VITE_N8N_WEBHOOK_BASE_URL}/{path}
 * (path = campo Path do node Webhook_1, sem webhookId no meio)
 */

const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL ?? '/webhook'

export const webhookPaths = {
  postClientes: 'clientes',
  getClientes: 'clientes',
  getCliente: (id: string) => `clientes/id/${id}`,
  deleteCliente: (id: string) => `clientes/remover/${id}`,
  postTickets: 'tickets',
  getTickets: 'tickets/listar',
  getTicket: (id: string) => `tickets/id/${id}`,
  deleteTicket: (id: string) => `tickets/remover/${id}`,
  patchTicketStatus: (id: string) => `tickets/atualizar-status/${id}`,
  postInteracao: (id: string) => `tickets/adicionar-interacao/${id}`,
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
    throw new ApiError(text || 'Resposta inválida da API', 'RESPOSTA_INVALIDA', response.status)
  }

  if (!response.ok) {
    const body = data as { erro?: string; message?: string; codigo?: string }
    const erro = body.erro ?? body.message ?? 'Erro na requisição'
    const codigo = body.codigo ?? 'ERRO_DESCONHECIDO'
    throw new ApiError(erro, codigo, response.status)
  }

  return data as T
}
