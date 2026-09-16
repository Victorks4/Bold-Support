import { apiFetch, buildWebhookUrl, webhookPaths } from './client'
import type { InteracaoTipo, Ticket, TicketInput, TicketStatus } from '@/lib/types/ticket'
import { sortByPrioridade } from '@/lib/utils/ticket-sort'

type ListTicketsResponse = {
  total: number
  filtros: { status?: string; prioridade?: string }
  tickets: Ticket[]
}

const ALL_STATUSES: TicketStatus[] = [
  'aberto',
  'em_atendimento',
  'aguardando_cliente',
  'resolvido',
  'cancelado',
]

export async function listTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
  const url = `${buildWebhookUrl(webhookPaths.getTickets)}?status=${status}`
  const data = await apiFetch<ListTicketsResponse>(url)
  return data.tickets ?? []
}

export async function fetchAllTickets(): Promise<Ticket[]> {
  const batches = await Promise.all(ALL_STATUSES.map((status) => listTicketsByStatus(status)))
  const byId = new Map<string, Ticket>()
  for (const ticket of batches.flat()) {
    byId.set(ticket.id, ticket)
  }
  return sortByPrioridade([...byId.values()])
}

export async function getTicket(id: string): Promise<Ticket> {
  const url = buildWebhookUrl(webhookPaths.getTicket(id))
  return apiFetch<Ticket>(url)
}

export async function createTicket(input: TicketInput): Promise<Ticket> {
  const url = buildWebhookUrl(webhookPaths.postTickets)
  return apiFetch<Ticket>(url, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function patchTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const url = buildWebhookUrl(webhookPaths.patchTicketStatus(id))
  return apiFetch<Ticket>(url, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function addTicketInteracao(
  id: string,
  tipo: InteracaoTipo,
  mensagem: string,
): Promise<unknown> {
  const url = buildWebhookUrl(webhookPaths.postInteracao(id))
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify({ tipo, mensagem }),
  })
}

export async function deleteTicket(id: string): Promise<void> {
  const url = buildWebhookUrl(webhookPaths.deleteTicket(id))
  await apiFetch(url, { method: 'DELETE' })
}
