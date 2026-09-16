import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, GripVertical } from 'lucide-react'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'
import type { Ticket, TicketStatus } from '@/lib/types/ticket'
import { STATUS_LABELS, STATUS_TRANSITIONS } from '@/lib/types/ticket'
import { relativeTime } from '@/lib/utils/time'
import { cn } from '@/lib/utils'

type KanbanCardProps = {
  ticket: Ticket
  clienteNome: string
  onStatusChange?: (ticketId: string, status: TicketStatus) => void | Promise<void>
  draggable?: boolean
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  dragDataType?: string
}

export function KanbanCard({
  ticket,
  clienteNome,
  onStatusChange,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
  dragDataType = 'application/x-bold-ticket-id',
}: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const transitions = STATUS_TRANSITIONS[ticket.status]

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(dragDataType, ticket.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: isDragging ? 0.45 : 1, scale: 1 }}
      whileHover={isDragging ? undefined : { y: -2, boxShadow: '0 8px 24px rgba(0,106,254,0.12)' }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-blue-100 dark:border-gray-800 dark:bg-[#161B26] dark:hover:border-blue-900',
        isDragging && 'border-[#006AFE]/40 shadow-md',
      )}
    >
      {draggable && (
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          className="absolute top-2 right-2 cursor-grab rounded-md p-1 text-gray-300 active:cursor-grabbing hover:bg-gray-50 hover:text-gray-500"
          aria-label="Arrastar chamado"
          title="Arrastar para outra coluna"
          onClick={(e) => e.preventDefault()}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <Link to={`/chamados/${ticket.id}`} className="block pr-6">
        <p className="text-[11px] font-medium text-gray-400">{ticket.protocolo}</p>
        <p className="text-app-heading mt-1 text-sm font-semibold leading-snug line-clamp-2">
          {ticket.titulo}
        </p>
        <p className="mt-2 text-xs text-gray-500">{clienteNome}</p>
        <div className="mt-3 flex items-center justify-between">
          <PriorityBadge prioridade={ticket.prioridade} />
          <span className="text-[11px] text-gray-400">{relativeTime(ticket.atualizado_em)}</span>
        </div>
      </Link>

      {onStatusChange && transitions.length > 0 && (
        <div ref={menuRef} className="relative mt-2 border-t border-gray-50 pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setMenuOpen((v) => !v)
            }}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-medium text-[#006AFE] hover:bg-blue-50"
          >
            Próximo status
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          {menuOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-1 w-full rounded-lg border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#1A2030]">
              {transitions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    void onStatusChange(ticket.id, s)
                    setMenuOpen(false)
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
