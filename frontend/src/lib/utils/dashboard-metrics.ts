import type { Ticket } from '@/lib/types/ticket'

export const volumeSemanal = [
  { label: 'S', value: 12 },
  { label: 'T', value: 18 },
  { label: 'Q', value: 15 },
  { label: 'Q', value: 22 },
  { label: 'S', value: 19 },
  { label: 'S', value: 8 },
  { label: 'D', value: 5 },
]

export type MetricStat = {
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function computeDashboardMetrics(tickets: Ticket[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const abertos = tickets.filter((t) => t.status === 'aberto').length
  const emAtendimento = tickets.filter((t) => t.status === 'em_atendimento').length
  const aguardando = tickets.filter((t) => t.status === 'aguardando_cliente').length
  const resolvidosHoje = tickets.filter((t) => {
    if (t.status !== 'resolvido') return false
    const updated = new Date(t.atualizado_em)
    updated.setHours(0, 0, 0, 0)
    return updated.getTime() === today.getTime()
  }).length

  const ativos = tickets.filter(
    (t) => t.status === 'aberto' || t.status === 'em_atendimento' || t.status === 'aguardando_cliente',
  ).length
  const resolvidos = tickets.filter((t) => t.status === 'resolvido').length
  const slaPercent = ativos + resolvidos > 0 ? Math.round((resolvidos / (ativos + resolvidos)) * 100) : 0

  const abertosStat: MetricStat = {
    value: abertos,
    trend: 'neutral',
    ...(aguardando > 0 ? { delta: `${aguardando} aguardando cliente` } : {}),
  }

  const emAtendimentoStat: MetricStat = {
    value: emAtendimento,
    trend: 'neutral',
    ...(emAtendimento > 0 ? { delta: 'na fila ativa' } : {}),
  }

  const resolvidosStat: MetricStat = {
    value: resolvidosHoje,
    trend: resolvidosHoje > 0 ? 'up' : 'neutral',
    ...(resolvidosHoje > 0 ? { delta: 'hoje' } : {}),
  }

  const slaStat: MetricStat = {
    value: `${slaPercent}%`,
    trend: slaPercent >= 70 ? 'up' : 'neutral',
    ...(ativos > 0 ? { delta: `${resolvidos} de ${ativos + resolvidos} encerrados` } : {}),
  }

  return {
    abertos: abertosStat,
    emAtendimento: emAtendimentoStat,
    slaMedio: slaStat,
    resolvidosHoje: resolvidosStat,
    slaPercent,
    slaSubtitle:
      ativos + resolvidos > 0
        ? `${resolvidos} de ${ativos + resolvidos} chamados encerrados no período.`
        : undefined,
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
