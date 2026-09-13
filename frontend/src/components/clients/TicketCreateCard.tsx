import { useState } from 'react'
import { ArrowRight, Headphones } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type { Cliente } from '@/lib/types/cliente'
import type { TicketPrioridade } from '@/lib/types/ticket'
import { PRIORIDADE_LABELS } from '@/lib/types/ticket'

type TicketCreateCardProps = {
  clientes: Cliente[]
  onCreate: (input: {
    cliente_id: string
    titulo: string
    descricao: string
    prioridade: TicketPrioridade
  }) => void
}

export function TicketCreateCard({ clientes, onCreate }: TicketCreateCardProps) {
  const navigate = useNavigate()
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? '')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<TicketPrioridade>('media')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clienteId || !titulo.trim() || !descricao.trim()) return
    onCreate({
      cliente_id: clienteId,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      prioridade,
    })
    navigate('/chamados')
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Headphones className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-emerald-600 uppercase">Etapa 02</p>
            <p className="text-sm font-bold text-app-heading">Criar novo chamado</p>
            <p className="text-app-muted text-xs">O cliente cadastrado fica disponível aqui.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Cliente</FieldLabel>
              <Select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel>Título</FieldLabel>
              <Input
                placeholder="Resumo do problema"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="h-10 rounded-xl"
              />
            </Field>
            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <Textarea
                placeholder="Descreva o chamado com detalhes..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
              />
            </Field>
            <Field>
              <FieldLabel>Prioridade</FieldLabel>
              <Select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as TicketPrioridade)}
              >
                {(Object.keys(PRIORIDADE_LABELS) as TicketPrioridade[]).map((p) => (
                  <option key={p} value={p}>{PRIORIDADE_LABELS[p]}</option>
                ))}
              </Select>
            </Field>
          </FieldGroup>
          <Button
            type="submit"
            disabled={!clienteId || !titulo.trim() || !descricao.trim()}
            className="mt-4 h-11 w-full rounded-xl bg-[#00E676] font-semibold text-app-heading hover:bg-[#00cc66] disabled:opacity-50"
          >
            Criar chamado
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
