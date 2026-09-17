import { apiFetch, buildWebhookUrl, webhookPaths } from './client'
import { parseTicket } from './ticket-parse'
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
  const results = await Promise.allSettled(
    ALL_STATUSES.map((status) => listTicketsByStatus(status)),
  )

  const byId = new Map<string, Ticket>()
  let failures = 0

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const ticket of result.value) {
        if (!ticket?.id || !ticket?.protocolo || !ticket?.titulo) continue
        byId.set(ticket.id, ticket)
      }
    } else {
      failures += 1
    }
  }

  if (failures === ALL_STATUSES.length) {
    const rejected = results.find((result) => result.status === 'rejected')
    throw (rejected as PromiseRejectedResult).reason
  }

  return sortByPrioridade([...byId.values()])
}

export async function getTicket(id: string): Promise<Ticket> {
  const url = buildWebhookUrl(webhookPaths.getTicket(id))
  return parseTicket(await apiFetch<unknown>(url))
}

export async function createTicket(input: TicketInput): Promise<Ticket> {
  const url = buildWebhookUrl(webhookPaths.postTickets)
  const data = await apiFetch<unknown>(url, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseTicket(data)
}

export async function patchTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const url = buildWebhookUrl(webhookPaths.patchTicketStatus(id))
  return parseTicket(
    await apiFetch<unknown>(url, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  )
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
