/**
 * Cliente HTTP para workflows n8n.
 * URLs: {VITE_N8N_WEBHOOK_BASE_URL}/{webhookId}/{path}
 */

const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL ?? '/webhook'

export const webhookIds = {
  postClientes: import.meta.env.VITE_WEBHOOK_ID_POST_CLIENTES ?? 'bold-post-clientes',
  getClientes: import.meta.env.VITE_WEBHOOK_ID_GET_CLIENTES ?? 'bold-get-clientes',
  getCliente: import.meta.env.VITE_WEBHOOK_ID_GET_CLIENTE ?? 'bold-get-cliente',
  deleteCliente: import.meta.env.VITE_WEBHOOK_ID_DELETE_CLIENTE ?? 'bold-delete-cliente',
  postTickets: import.meta.env.VITE_WEBHOOK_ID_POST_TICKETS ?? 'bold-post-tickets',
  getTickets: import.meta.env.VITE_WEBHOOK_ID_GET_TICKETS ?? 'bold-get-tickets',
  getTicket: import.meta.env.VITE_WEBHOOK_ID_GET_TICKET ?? 'bold-get-ticket-id',
  deleteTicket: import.meta.env.VITE_WEBHOOK_ID_DELETE_TICKET ?? 'bold-delete-ticket',
  patchStatus: import.meta.env.VITE_WEBHOOK_ID_PATCH_STATUS ?? 'bold-patch-ticket-status',
  postInteracao: import.meta.env.VITE_WEBHOOK_ID_POST_INTERACAO ?? 'bold-post-ticket-interacao',
} as const

export const webhookPaths = {
  postClientes: 'clientes',
  getClientes: 'clientes',
  getCliente: (id: string) => `clientes/${id}`,
  deleteCliente: (id: string) => `clientes/remover/${id}`,
  postTickets: 'tickets',
  getTickets: 'tickets',
  getTicket: (id: string) => `tickets/${id}`,
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

export function buildWebhookUrl(webhookId: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, '')
  return `${normalizedBase}/${webhookId}/${path}`
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
  const data = text ? (JSON.parse(text) as T & { erro?: string; codigo?: string }) : ({} as T)

  if (!response.ok) {
    const erro = (data as { erro?: string }).erro ?? 'Erro na requisição'
    const codigo = (data as { codigo?: string }).codigo ?? 'ERRO_DESCONHECIDO'
    throw new ApiError(erro, codigo, response.status)
  }

  return data as T
}
