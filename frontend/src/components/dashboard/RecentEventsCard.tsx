import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { WebhookEvento } from '@/lib/types/evento'
import { EVENTO_LABELS } from '@/lib/types/evento'
import { relativeTime } from '@/lib/utils/time'

const tipoVariant: Record<WebhookEvento['tipo'], 'info' | 'success' | 'warning'> = {
  status_alterado: 'info',
  interacao_adicionada: 'success',
  ticket_excluido: 'warning',
}

type RecentEventsCardProps = {
  eventos: WebhookEvento[]
  limit?: number
}

export function RecentEventsCard({ eventos, limit = 5 }: RecentEventsCardProps) {
  const recent = eventos.slice(0, limit)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <p className="text-app-heading text-sm font-bold">Últimos eventos</p>
        <p className="text-app-muted text-xs">Webhooks simulados do n8n</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {recent.length === 0 ? (
          <p className="flex flex-1 items-center justify-center py-6 text-center text-xs text-gray-400">
            Nenhum evento ainda. Alterações de status e interações aparecem aqui.
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((evento) => (
              <li key={evento.id}>
                <Link
                  to={`/chamados/${evento.ticket_id}`}
                  className="block rounded-xl border border-gray-100 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant={tipoVariant[evento.tipo]} className="text-[10px]">
                      {EVENTO_LABELS[evento.tipo]}
                    </Badge>
                    <span className="shrink-0 text-[10px] text-gray-400">
                      {relativeTime(evento.criado_em)}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-xs text-[#006AFE]">{evento.protocolo}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/eventos"
          className="mt-4 block text-center text-xs font-semibold text-[#006AFE] hover:underline"
        >
          Ver todos os eventos →
        </Link>
      </CardContent>
    </Card>
  )
}
