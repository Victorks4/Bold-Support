import { useState } from 'react'
import { KanbanCard } from './KanbanCard'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import type { Ticket, TicketStatus } from '@/lib/types/ticket'
import { STATUS_LABELS } from '@/lib/types/ticket'
import { canDropInColumn, resolveDropStatus, type KanbanColumnKey } from '@/lib/utils/kanban-dnd'
import { cn } from '@/lib/utils'

const COLUMNS: { key: KanbanColumnKey; label: string; accent: string }[] = [
  { key: 'aberto', label: STATUS_LABELS.aberto, accent: 'border-t-emerald-500' },
  { key: 'em_atendimento', label: STATUS_LABELS.em_atendimento, accent: 'border-t-[#006AFE]' },
  { key: 'aguardando_cliente', label: STATUS_LABELS.aguardando_cliente, accent: 'border-t-gray-400' },
  { key: 'encerrados', label: 'Encerrados', accent: 'border-t-gray-300' },
]

const TICKET_DRAG_TYPE = 'application/x-bold-ticket-id'

type KanbanBoardProps = {
  tickets: Ticket[]
  getClienteNome: (id: string) => string
  onStatusChange?: (ticketId: string, status: TicketStatus) => void
}

function getColumnTickets(tickets: Ticket[], column: KanbanColumnKey): Ticket[] {
  if (column === 'encerrados') {
    return tickets
      .filter((t) => t.status === 'resolvido' || t.status === 'cancelado')
      .sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime())
  }
  return tickets.filter((t) => t.status === column)
}

export function KanbanBoard({ tickets, getClienteNome, onStatusChange }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumnKey | null>(null)

  const draggingTicket = draggingId ? tickets.find((t) => t.id === draggingId) : undefined

  function handleDragStart(ticketId: string) {
    setDraggingId(ticketId)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverColumn(null)
  }

  function handleDragOver(e: React.DragEvent, column: KanbanColumnKey) {
    e.preventDefault()
    if (!draggingTicket) return
    e.dataTransfer.dropEffect = canDropInColumn(column, draggingTicket.status) ? 'move' : 'none'
    setDragOverColumn(column)
  }

  function handleDrop(e: React.DragEvent, column: KanbanColumnKey) {
    e.preventDefault()
    const ticketId = e.dataTransfer.getData(TICKET_DRAG_TYPE) || draggingId
    if (!ticketId || !onStatusChange) {
      handleDragEnd()
      return
    }

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) {
      handleDragEnd()
      return
    }

    const nextStatus = resolveDropStatus(column, ticket.status)
    if (nextStatus) onStatusChange(ticketId, nextStatus)
    handleDragEnd()
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map(({ key, label, accent }) => {
        const columnTickets = getColumnTickets(tickets, key)
        const isValidTarget =
          draggingTicket !== undefined && canDropInColumn(key, draggingTicket.status)
        const isDragOver = dragOverColumn === key

        return (
          <div
            key={key}
            onDragOver={(e) => handleDragOver(e, key)}
            onDragLeave={() => setDragOverColumn((prev) => (prev === key ? null : prev))}
            onDrop={(e) => handleDrop(e, key)}
            className={cn(
              'flex flex-col rounded-2xl border border-gray-100 border-t-4 bg-gray-50/80 p-4 transition-colors dark:border-gray-800 dark:bg-[#1A2030]/80',
              accent,
              isDragOver && isValidTarget && 'border-[#006AFE] bg-blue-50/60 ring-2 ring-[#006AFE]/20',
              isDragOver && draggingTicket && !isValidTarget && 'border-red-200 bg-red-50/40',
            )}
          >
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <h3 className="text-app-heading text-sm font-bold">{label}</h3>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-500 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                {columnTickets.length}
              </span>
            </div>
            <div className="max-h-[min(70vh,640px)] space-y-3 overflow-y-auto pr-1">
              {columnTickets.length === 0 ? (
                <p
                  className={cn(
                    'rounded-xl border border-dashed py-8 text-center text-xs text-gray-400',
                    isDragOver && isValidTarget && 'border-[#006AFE] bg-white/80 text-[#006AFE]',
                  )}
                >
                  {isDragOver && isValidTarget ? 'Solte aqui' : 'Nenhum chamado nesta etapa'}
                </p>
              ) : (
                columnTickets.map((ticket) => (
                  <div key={ticket.id} className="space-y-1">
                    {key === 'encerrados' && (
                      <div className="px-1">
                        <StatusBadge status={ticket.status} />
                      </div>
                    )}
                    <KanbanCard
                      ticket={ticket}
                      clienteNome={getClienteNome(ticket.cliente_id)}
                      onStatusChange={onStatusChange}
                      draggable={Boolean(onStatusChange && ticket.status !== 'resolvido' && ticket.status !== 'cancelado')}
                      isDragging={draggingId === ticket.id}
                      onDragStart={() => handleDragStart(ticket.id)}
                      onDragEnd={handleDragEnd}
                      dragDataType={TICKET_DRAG_TYPE}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
