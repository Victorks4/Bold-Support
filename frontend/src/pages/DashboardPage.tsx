import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { RecentTicketCard } from '@/components/dashboard/RecentTicketCard'
import { SlaRing } from '@/components/dashboard/SlaRing'
import { StatCard } from '@/components/dashboard/StatCard'
import { VolumeChart } from '@/components/dashboard/VolumeChart'
import { RecentEventsCard } from '@/components/dashboard/RecentEventsCard'
import { staggerContainer, staggerItem } from '@/components/motion/PageTransition'
import { Button } from '@/components/ui/button'
import { volumeSemanal } from '@/lib/mocks/dashboard'
import { useAppData } from '@/lib/store/AppDataContext'
import { computeDashboardMetrics } from '@/lib/utils/dashboard-metrics'
import { greeting } from '@/lib/utils/time'

export function DashboardPage() {
  const { tickets, eventos, getClienteNome } = useAppData()
  const recent = tickets.slice(0, 3)
  const stats = computeDashboardMetrics(tickets)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem} className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-[#006AFE] uppercase">Visão geral</p>
          <h1 className="text-app-heading text-2xl font-bold sm:text-3xl">{greeting()}, Bruno.</h1>
          <p className="text-app-muted mt-1 text-sm">Console de atendimento Bold Support</p>
        </div>
        <Link to="/clientes" className="w-full sm:w-auto">
          <Button className="h-11 w-full rounded-xl bg-[#006AFE] px-5 font-semibold text-white hover:bg-[#0058D6] sm:w-auto">
            <Plus className="h-4 w-4" />
            Abrir chamado
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chamados abertos" value={stats.abertos.value} delta={stats.abertos.delta} trend={stats.abertos.trend} />
        <StatCard label="Em atendimento" value={stats.emAtendimento.value} delta={stats.emAtendimento.delta} trend={stats.emAtendimento.trend} />
        <StatCard label="SLA" value={stats.slaMedio.value} delta={stats.slaMedio.delta} trend={stats.slaMedio.trend} />
        <StatCard label="Resolvidos hoje" value={stats.resolvidosHoje.value} delta={stats.resolvidosHoje.delta} trend={stats.resolvidosHoje.trend} />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <VolumeChart data={volumeSemanal} />
        </div>
        <div className="lg:col-span-1">
          <SlaRing percent={stats.slaPercent} subtitle={stats.slaSubtitle} />
        </div>
        <div className="lg:col-span-1">
          <RecentEventsCard eventos={eventos} />
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-app-heading text-lg font-bold">Chamados recentes</h2>
          <Link to="/fila" className="text-sm font-semibold text-[#006AFE] hover:underline">
            Ver fila →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
            >
              <RecentTicketCard ticket={ticket} clienteNome={getClienteNome(ticket.cliente_id)} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
