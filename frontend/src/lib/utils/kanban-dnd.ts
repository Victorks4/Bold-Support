import { STATUS_TRANSITIONS, type TicketStatus } from '@/lib/types/ticket'

export type KanbanColumnKey = TicketStatus | 'encerrados'

export function resolveDropStatus(
  column: KanbanColumnKey,
  currentStatus: TicketStatus,
): TicketStatus | null {
  if (column === 'encerrados') {
    const allowed = STATUS_TRANSITIONS[currentStatus]
    if (allowed.includes('resolvido')) return 'resolvido'
    if (allowed.includes('cancelado')) return 'cancelado'
    return null
  }

  const target = column as TicketStatus
  if (target === currentStatus) return null
  if (STATUS_TRANSITIONS[currentStatus].includes(target)) return target
  return null
}

export function canDropInColumn(column: KanbanColumnKey, currentStatus: TicketStatus): boolean {
  return resolveDropStatus(column, currentStatus) !== null
}
