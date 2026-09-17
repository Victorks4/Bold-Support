import { ApiError } from './client'
import type { Interacao, InteracaoTipo, Ticket, TicketPrioridade, TicketStatus } from '@/lib/types/ticket'

export function parseTicket(data: unknown): Ticket {
  if (!data || typeof data !== 'object') {
    throw new ApiError('Resposta inválida da API de chamados.', 'RESPOSTA_INVALIDA', 502)
  }

  const record = data as Record<string, unknown>
  const nested =
    record.ticket && typeof record.ticket === 'object'
      ? (record.ticket as Record<string, unknown>)
      : record

  const required = [
    'id',
    'protocolo',
    'cliente_id',
    'titulo',
    'descricao',
    'prioridade',
    'status',
  ] as const

  for (const field of required) {
    const value = nested[field]
    if (value == null || (typeof value === 'string' && value.trim() === '')) {
      throw new ApiError('Resposta inválida da API de chamados.', 'RESPOSTA_INVALIDA', 502)
    }
  }

  const toIso = (value: unknown) => {
    if (value == null || value === '') return new Date().toISOString()
    if (typeof value === 'string') return value
    const parsed = new Date(value as string | number | Date)
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
  }

  const ticketId = String(nested.id)
  const interacoes = parseInteracoes(nested.interacoes, ticketId, toIso)

  const ticket: Ticket = {
    id: ticketId,
    protocolo: String(nested.protocolo),
    cliente_id: String(nested.cliente_id),
    titulo: String(nested.titulo),
    descricao: String(nested.descricao),
    prioridade: String(nested.prioridade) as TicketPrioridade,
    status: String(nested.status) as TicketStatus,
    criado_em: toIso(nested.criado_em),
    atualizado_em: toIso(nested.atualizado_em),
  }

  if (interacoes) {
    ticket.interacoes = interacoes
  }

  return ticket
}

function parseInteracoes(
  value: unknown,
  ticketId: string,
  toIso: (value: unknown) => string,
): Interacao[] | undefined {
  if (!Array.isArray(value)) return undefined

  const interacoes: Interacao[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    if (!row.id || !row.tipo || row.mensagem == null) continue

    interacoes.push({
      id: String(row.id),
      ticket_id: row.ticket_id ? String(row.ticket_id) : ticketId,
      tipo: String(row.tipo) as InteracaoTipo,
      mensagem: String(row.mensagem),
      criado_em: toIso(row.criado_em),
    })
  }

  return interacoes
}
