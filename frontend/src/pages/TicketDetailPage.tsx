import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { INTERACAO_MAX_LENGTH } from '@/lib/constants/field-limits'
import { clampText } from '@/lib/utils/input-masks'
import { ArrowLeft, Bot, MessageSquare, Trash2, User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FieldHint } from '@/components/ui/field'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAppData } from '@/lib/store/AppDataContext'
import {
  STATUS_LABELS,
  STATUS_TRANSITIONS,
  type InteracaoTipo,
  type TicketStatus,
} from '@/lib/types/ticket'
import { relativeTime } from '@/lib/utils/time'

const tipoIcon: Record<InteracaoTipo, typeof Bot> = {
  sistema: Bot,
  cliente: User,
  agente: MessageSquare,
}

const tipoLabel: Record<InteracaoTipo, string> = {
  sistema: 'Sistema',
  cliente: 'Registro do cliente',
  agente: 'Agente',
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    getTicketById,
    getClienteNome,
    updateTicketStatus,
    addInteracao,
    removeTicket,
    loadTicketDetail,
    isLoading,
  } = useAppData()
  const ticket = id ? getTicketById(id) : undefined
  const reducedMotion = useReducedMotion()
  const [mensagem, setMensagem] = useState('')
  const [registroCliente, setRegistroCliente] = useState('')

  useEffect(() => {
    if (id) void loadTicketDetail(id)
  }, [id, loadTicketDetail])

  const interacoes = useMemo(
    () =>
      [...(ticket?.interacoes ?? [])].sort(
        (a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime(),
      ),
    [ticket?.interacoes],
  )

  if (isLoading && !ticket) {
    return <p className="text-app-muted py-12 text-center text-sm">Carregando chamado...</p>
  }

  if (!ticket) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Chamado não encontrado.</p>
        <Link to="/chamados" className="mt-4 inline-block text-[#006AFE] hover:underline">
          Voltar para chamados
        </Link>
      </div>
    )
  }

  const allowedStatuses = STATUS_TRANSITIONS[ticket.status]

  async function handleStatusChange(status: TicketStatus) {
    try {
      await updateTicketStatus(ticket!.id, status)
    } catch {
      // actionError já definido no AppDataContext
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!mensagem.trim()) return
    await addInteracao(ticket!.id, 'agente', mensagem.trim())
    setMensagem('')
  }

  async function handleClienteRegistro(e: React.FormEvent) {
    e.preventDefault()
    if (!registroCliente.trim()) return
    await addInteracao(ticket!.id, 'cliente', registroCliente.trim())
    setRegistroCliente('')
  }

  async function handleRemove() {
    if (!window.confirm('Encerrar e remover este chamado? Esta ação não pode ser desfeita.')) return
    await removeTicket(ticket!.id)
    navigate('/chamados')
  }

  return (
    <div>
      <Link
        to="/chamados"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#006AFE]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <PageHeader
        eyebrow={ticket.protocolo}
        title={ticket.titulo}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge prioridade={ticket.prioridade} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <p className="text-sm font-bold text-app-heading">Descrição</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-gray-600">{ticket.descricao}</p>
              <p className="mt-4 text-xs text-gray-400">
                Cliente: <span className="font-medium text-gray-600">{getClienteNome(ticket.cliente_id)}</span>
                {' · '}
                Aberto {relativeTime(ticket.criado_em)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-bold text-app-heading">Histórico de interações</p>
              <p className="text-xs text-gray-500">Logs do chamado</p>
            </CardHeader>
            <CardContent>
              {interacoes.length === 0 ? (
                <p className="text-center text-sm text-gray-400">Nenhuma interação registrada ainda.</p>
              ) : (
                <div className="space-y-4">
                  {interacoes.map((item, index) => {
                    const Icon = tipoIcon[item.tipo]
                    const row = (
                      <>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <Icon className="h-4 w-4 text-gray-500" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-app-heading">{tipoLabel[item.tipo]}</span>
                            <span className="text-xs text-gray-400">{relativeTime(item.criado_em)}</span>
                          </div>
                          <p className="mt-1 break-words text-sm text-gray-600">{item.mensagem}</p>
                        </div>
                      </>
                    )

                    if (reducedMotion) {
                      return (
                        <div key={item.id} className="flex gap-3">
                          {row}
                        </div>
                      )
                    }

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.3 }}
                        className="flex gap-3"
                      >
                        {row}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <p className="text-sm font-bold text-app-heading">Alterar status</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {allowedStatuses.length === 0 ? (
                <p className="text-xs text-gray-500">Status terminal. Sem transições disponíveis.</p>
              ) : (
                allowedStatuses.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    className="h-9 w-full justify-start rounded-xl border-gray-200 text-sm"
                    onClick={() => handleStatusChange(s)}
                  >
                    {STATUS_LABELS[s]}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-bold text-app-heading">Registrar nota do agente</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-3">
                <Textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(clampText(e.target.value, INTERACAO_MAX_LENGTH))}
                  placeholder="Registre o que foi feito ou comunicado ao cliente..."
                  maxLength={INTERACAO_MAX_LENGTH}
                  aria-describedby="nota-agente-hint"
                  rows={4}
                />
                <FieldHint id="nota-agente-hint">
                  {mensagem.length}/{INTERACAO_MAX_LENGTH} caracteres
                </FieldHint>
                <Button
                  type="submit"
                  className="h-10 w-full rounded-xl bg-[#006AFE] font-semibold text-white hover:bg-[#0058D6]"
                >
                  Enviar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm font-bold text-app-heading">Registro do cliente</p>
              <p className="text-xs text-gray-500">E-mail, telefone ou retorno recebido</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClienteRegistro} className="space-y-3">
                <Textarea
                  value={registroCliente}
                  onChange={(e) =>
                    setRegistroCliente(clampText(e.target.value, INTERACAO_MAX_LENGTH))
                  }
                  placeholder="Ex.: Cliente retornou por e-mail confirmando resolução..."
                  maxLength={INTERACAO_MAX_LENGTH}
                  aria-describedby="registro-cliente-hint"
                  rows={3}
                />
                <FieldHint id="registro-cliente-hint">
                  {registroCliente.length}/{INTERACAO_MAX_LENGTH} caracteres
                </FieldHint>
                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-full rounded-xl border-gray-200 font-semibold"
                >
                  Registrar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={handleRemove}
                className="h-10 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Encerrar e remover
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
