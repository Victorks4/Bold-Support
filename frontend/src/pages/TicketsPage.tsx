import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, List, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { TicketCardList } from '@/components/tickets/TicketCardList'
import { TicketTable } from '@/components/tickets/TicketTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAppData } from '@/lib/store/AppDataContext'
import type { TicketPrioridade, TicketStatus } from '@/lib/types/ticket'
import { PRIORIDADE_LABELS, STATUS_LABELS } from '@/lib/types/ticket'

export function TicketsPage() {
  const { tickets, getClienteNome } = useAppData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('')
  const [prioridadeFilter, setPrioridadeFilter] = useState<TicketPrioridade | ''>('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tickets.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false
      if (prioridadeFilter && t.prioridade !== prioridadeFilter) return false
      if (!q) return true
      const cliente = getClienteNome(t.cliente_id).toLowerCase()
      return (
        t.protocolo.toLowerCase().includes(q) ||
        t.titulo.toLowerCase().includes(q) ||
        cliente.includes(q)
      )
    })
  }, [tickets, search, statusFilter, prioridadeFilter, getClienteNome])

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Central de chamados"
        action={
          <Link to="/clientes">
            <Button className="h-10 rounded-xl bg-[#006AFE] px-4 font-semibold text-white hover:bg-[#0058D6]">
              <Plus className="h-4 w-4" />
              Abrir chamado
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por protocolo, título ou cliente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-xl pl-10 shadow-none"
          />
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-xl border-gray-200"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
        <div className="flex rounded-xl border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-[#161B26]">
          <button type="button" className="rounded-lg bg-gray-100 p-2 text-gray-700" aria-label="Lista">
            <List className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-lg p-2 text-gray-400" aria-label="Grid">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-[#161B26]">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
            className="h-9 rounded-lg"
          >
            <option value="">Todos os status</option>
            {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </Select>
          <Select
            value={prioridadeFilter}
            onChange={(e) => setPrioridadeFilter(e.target.value as TicketPrioridade | '')}
            className="h-9 rounded-lg"
          >
            <option value="">Todas as prioridades</option>
            {(Object.keys(PRIORIDADE_LABELS) as TicketPrioridade[]).map((p) => (
              <option key={p} value={p}>{PRIORIDADE_LABELS[p]}</option>
            ))}
          </Select>
        </div>
      )}

      <TicketCardList tickets={filtered} getClienteNome={getClienteNome} />
      <TicketTable tickets={filtered} getClienteNome={getClienteNome} />
    </div>
  )
}
