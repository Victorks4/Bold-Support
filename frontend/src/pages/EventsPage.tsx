import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layout/PageHeader'
import { EventLog } from '@/components/events/EventLog'
import { staggerContainer, staggerItem } from '@/components/motion/PageTransition'
import { useAppData } from '@/lib/store/AppDataContext'

export function EventsPage() {
  const { eventos } = useAppData()

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem}>
        <PageHeader
          eyebrow="Integração"
          title="Eventos do sistema"
        />
        <p className="text-app-muted mb-6 text-sm">
          Registro simulado dos webhooks HTTP que o n8n dispara para sistemas externos quando um chamado
          é atualizado. Na produção, estes eventos saem automaticamente do backend — não são configurados
          pelo agente.
        </p>
      </motion.div>
      <motion.div variants={staggerItem}>
        <EventLog eventos={eventos} />
      </motion.div>
    </motion.div>
  )
}
