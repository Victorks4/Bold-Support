import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/PageHeader'
import { staggerContainer, staggerItem } from '@/components/motion/PageTransition'
import { KanbanBoard } from '@/components/queue/KanbanBoard'
import { Button } from '@/components/ui/button'
import { useAppData } from '@/lib/store/AppDataContext'

export function QueuePage() {
  const { tickets, getClienteNome, updateTicketStatus } = useAppData()

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem}>
        <PageHeader
          eyebrow="Operação"
          title="Fila de atendimento"
          action={
            <Link to="/clientes">
              <Button className="h-10 rounded-xl bg-[#006AFE] px-4 font-semibold text-white hover:bg-[#0058D6]">
                <Plus className="h-4 w-4" />
                Abrir chamado
              </Button>
            </Link>
          }
        />
        <p className="text-app-muted mb-6 text-sm">
          Visão kanban de todos os chamados. Arraste pelo ícone ⋮⋮ ou use a ação rápida no card para mudar o status.
        </p>
      </motion.div>
      <motion.div variants={staggerItem}>
        <KanbanBoard
          tickets={tickets}
          getClienteNome={getClienteNome}
          onStatusChange={updateTicketStatus}
        />
      </motion.div>
    </motion.div>
  )
}
