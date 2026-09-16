import { describe, expect, it, vi, afterEach } from 'vitest'
import type { Ticket } from '@/lib/types/ticket'
import { computeDashboardMetrics, countActiveTickets } from '@/lib/utils/dashboard-metrics'

function makeTicket(overrides: Partial<Ticket> & Pick<Ticket, 'id' | 'status'>): Ticket {
  return {
    protocolo: 'BS-0001',
    cliente_id: 'cliente-1',
    titulo: 'Teste',
    descricao: 'Desc',
    prioridade: 'media',
    criado_em: '2026-01-01T10:00:00Z',
    atualizado_em: '2026-01-01T10:00:00Z',
    ...overrides,
  }
}

describe('computeDashboardMetrics', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('conta tickets por status', () => {
    const tickets = [
      makeTicket({ id: '1', status: 'aberto' }),
      makeTicket({ id: '2', status: 'em_atendimento' }),
      makeTicket({ id: '3', status: 'aguardando_cliente' }),
      makeTicket({ id: '4', status: 'resolvido' }),
    ]

    const metrics = computeDashboardMetrics(tickets)
    expect(metrics.abertos.value).toBe(1)
    expect(metrics.emAtendimento.value).toBe(1)
    expect(metrics.abertos.delta).toBe('1 aguardando cliente')
  })

  it('calcula SLA percent com tickets ativos e resolvidos', () => {
    const tickets = [
      makeTicket({ id: '1', status: 'aberto' }),
      makeTicket({ id: '2', status: 'resolvido' }),
      makeTicket({ id: '3', status: 'resolvido' }),
    ]

    const metrics = computeDashboardMetrics(tickets)
    expect(metrics.slaPercent).toBe(67)
    expect(metrics.slaMedio.value).toBe('67%')
  })

  it('conta resolvidos hoje', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T15:00:00Z'))

    const tickets = [
      makeTicket({
        id: '1',
        status: 'resolvido',
        atualizado_em: '2026-03-16T12:00:00Z',
      }),
      makeTicket({
        id: '2',
        status: 'resolvido',
        atualizado_em: '2026-03-15T12:00:00Z',
      }),
    ]

    const metrics = computeDashboardMetrics(tickets)
    expect(metrics.resolvidosHoje.value).toBe(1)
  })
})

describe('countActiveTickets', () => {
  it('conta apenas status ativos', () => {
    const tickets = [
      makeTicket({ id: '1', status: 'aberto' }),
      makeTicket({ id: '2', status: 'resolvido' }),
      makeTicket({ id: '3', status: 'em_atendimento' }),
    ]

    expect(countActiveTickets(tickets)).toBe(2)
  })
})
