import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { WebhookEvento } from '@/lib/types/evento'
import { EVENTO_LABELS } from '@/lib/types/evento'
import { relativeTime } from '@/lib/utils/time'

const tipoVariant: Record<WebhookEvento['tipo'], 'info' | 'success' | 'warning'> = {
  status_alterado: 'info',
  interacao_adicionada: 'success',
  ticket_excluido: 'warning',
}

export function EventLog({ eventos }: { eventos: WebhookEvento[] }) {
  if (eventos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-gray-500">
          Nenhum evento registrado ainda. Altere o status de um chamado ou registre uma interação para
          ver o mesmo payload enviado ao webhook.site.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {eventos.map((evento, index) => (
        <motion.div
          key={evento.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04, duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="flex flex-wrap items-start justify-between gap-4 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={tipoVariant[evento.tipo]}>{EVENTO_LABELS[evento.tipo]}</Badge>
                  {evento.ticket_id ? (
                    <Link
                      to={`/chamados/${evento.ticket_id}`}
                      className="text-xs font-mono text-[#006AFE] hover:underline"
                    >
                      {evento.protocolo}
                    </Link>
                  ) : (
                    <span className="text-xs font-mono text-gray-500">{evento.protocolo}</span>
                  )}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase dark:bg-gray-800">
                    {evento.origem === 'webhook.site' ? 'webhook.site' : evento.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 rounded-lg bg-gray-50 p-3 text-xs sm:grid-cols-3 dark:bg-gray-900/50">
                  <div>
                    <p className="font-semibold text-gray-500">protocolo</p>
                    <p className="font-mono text-gray-800 dark:text-gray-200">{evento.payload.protocolo}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">evento</p>
                    <p className="font-mono text-gray-800 dark:text-gray-200">{evento.payload.evento}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-500">status</p>
                    <p className="font-mono text-gray-800 dark:text-gray-200">{evento.payload.status}</p>
                  </div>
                </div>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{relativeTime(evento.criado_em)}</span>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
