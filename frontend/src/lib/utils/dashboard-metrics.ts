import type { Ticket } from '@/lib/types/ticket'

export function computeDashboardMetrics(tickets: Ticket[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const abertos = tickets.filter((t) => t.status === 'aberto').length
  const emAtendimento = tickets.filter((t) => t.status === 'em_atendimento').length
  const resolvidosHoje = tickets.filter((t) => {
    if (t.status !== 'resolvido') return false
    const updated = new Date(t.atualizado_em)
    updated.setHours(0, 0, 0, 0)
    return updated.getTime() === today.getTime()
  }).length

  const aguardando = tickets.filter((t) => t.status === 'aguardando_cliente').length

  return {
    abertos: { value: abertos, delta: aguardando > 0 ? `${aguardando} aguardando` : '—', trend: 'neutral' as const },
    emAtendimento: { value: emAtendimento, delta: 'na fila ativa', trend: 'neutral' as const },
    slaMedio: { value: '1h 42', delta: '-12 min', trend: 'up' as const },
    resolvidosHoje: { value: resolvidosHoje, delta: resolvidosHoje > 0 ? 'hoje' : 'nenhum hoje', trend: 'up' as const },
  }
}

export function countActiveTickets(tickets: Ticket[]): number {
  return tickets.filter(
    (t) =>
      t.status === 'aberto' ||
      t.status === 'em_atendimento' ||
      t.status === 'aguardando_cliente',
  ).length
}
