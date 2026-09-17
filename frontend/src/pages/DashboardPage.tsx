import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RecentTicketCard } from '@/components/dashboard/RecentTicketCard'
import { SlaRing } from '@/components/dashboard/SlaRing'
import { StatCard } from '@/components/dashboard/StatCard'
import { VolumeChart } from '@/components/dashboard/VolumeChart'
import { RecentEventsCard } from '@/components/dashboard/RecentEventsCard'
import { staggerContainer, staggerItem, staggerItemReduced } from '@/components/motion/PageTransition'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/AuthContext'
import { useAppData } from '@/lib/store/AppDataContext'
import { computeDashboardMetrics, volumeSemanal } from '@/lib/utils/dashboard-metrics'
import { greeting } from '@/lib/utils/time'

export function DashboardPage() {
  const { agente } = useAuth()
  const { tickets, eventos, getClienteNome } = useAppData()
  const reducedMotion = useReducedMotion()
  const itemVariant = reducedMotion ? staggerItemReduced : staggerItem

  const recent = useMemo(() => tickets.slice(0, 3), [tickets])
  const stats = useMemo(() => computeDashboardMetrics(tickets), [tickets])
  const primeiroNome = agente?.nome?.trim().split(/\s+/)[0] ?? 'Agente'

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={itemVariant} className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-[#006AFE] uppercase">Visão geral</p>
          <h1 className="text-app-heading text-2xl font-bold sm:text-3xl">{greeting()}, {primeiroNome}.</h1>
          <p className="text-app-muted mt-1 text-sm">Console de atendimento Bold Support</p>
        </div>
        <Link to="/clientes" className="w-full sm:w-auto">
          <Button className="h-11 w-full rounded-xl bg-[#006AFE] px-5 font-semibold text-white hover:bg-[#0058D6] sm:w-auto">
            <Plus className="h-4 w-4" />
            Abrir chamado
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={itemVariant} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Chamados abertos" value={stats.abertos.value} delta={stats.abertos.delta} trend={stats.abertos.trend} />
        <StatCard label="Em atendimento" value={stats.emAtendimento.value} delta={stats.emAtendimento.delta} trend={stats.emAtendimento.trend} />
        <StatCard label="SLA" value={stats.slaMedio.value} delta={stats.slaMedio.delta} trend={stats.slaMedio.trend} />
        <StatCard label="Resolvidos hoje" value={stats.resolvidosHoje.value} delta={stats.resolvidosHoje.delta} trend={stats.resolvidosHoje.trend} />
      </motion.div>

      <motion.div variants={itemVariant} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
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

      <motion.div variants={itemVariant} className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-app-heading text-lg font-bold">Chamados recentes</h2>
          <Link to="/fila" className="text-sm font-semibold text-[#006AFE] hover:underline">
            Ver fila →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((ticket) => (
            <div key={ticket.id}>
              <RecentTicketCard ticket={ticket} clienteNome={getClienteNome(ticket.cliente_id)} />
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
