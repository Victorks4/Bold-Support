import { describe, expect, it } from 'vitest'
import type { Ticket } from '@/lib/types/ticket'
import { sortByPrioridade } from '@/lib/utils/ticket-sort'

function makeTicket(overrides: Partial<Ticket> & Pick<Ticket, 'id' | 'prioridade' | 'criado_em'>): Ticket {
  return {
    protocolo: 'BS-0001',
    cliente_id: 'cliente-1',
    titulo: 'Teste',
    descricao: 'Desc',
    status: 'aberto',
    atualizado_em: overrides.criado_em,
    ...overrides,
  }
}

describe('sortByPrioridade', () => {
  it('ordena por prioridade alta antes de media e baixa', () => {
    const tickets = [
      makeTicket({ id: '1', prioridade: 'baixa', criado_em: '2026-01-01T10:00:00Z' }),
      makeTicket({ id: '2', prioridade: 'alta', criado_em: '2026-01-01T11:00:00Z' }),
      makeTicket({ id: '3', prioridade: 'media', criado_em: '2026-01-01T09:00:00Z' }),
    ]

    const sorted = sortByPrioridade(tickets)
    expect(sorted.map((t) => t.id)).toEqual(['2', '3', '1'])
  })

  it('desempata por criado_em quando prioridade é igual', () => {
    const tickets = [
      makeTicket({ id: '1', prioridade: 'media', criado_em: '2026-01-02T10:00:00Z' }),
      makeTicket({ id: '2', prioridade: 'media', criado_em: '2026-01-01T10:00:00Z' }),
    ]

    const sorted = sortByPrioridade(tickets)
    expect(sorted.map((t) => t.id)).toEqual(['2', '1'])
  })
})
