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
          Mesmo payload enviado pelo n8n ao webhook.site: protocolo, evento e status. Eventos locais
          aparecem ao usar o app; com <code className="text-xs">VITE_WEBHOOK_SITE_TOKEN</code> no{' '}
          <code className="text-xs">.env</code>, também sincroniza o que chegar no webhook.site.
        </p>
      </motion.div>
      <motion.div variants={staggerItem}>
        <EventLog eventos={eventos} />
      </motion.div>
    </motion.div>
  )
}
