import { useEffect, useState } from 'react'
import { ArrowRight, Headphones } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FormAlert } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api/client'
import type { Cliente } from '@/lib/types/cliente'
import type { TicketPrioridade } from '@/lib/types/ticket'
import { PRIORIDADE_LABELS } from '@/lib/types/ticket'
import {
  hasFieldErrors,
  mapTicketApiError,
  validateTicketInput,
  type FieldErrors,
} from '@/lib/utils/form-validation'
import { cn } from '@/lib/utils'

type TicketCreateCardProps = {
  clientes: Cliente[]
  onCreate: (input: {
    cliente_id: string
    titulo: string
    descricao: string
    prioridade: TicketPrioridade
  }) => void | Promise<unknown>
}

type TicketField = 'cliente_id' | 'titulo' | 'descricao'

export function TicketCreateCard({ clientes, onCreate }: TicketCreateCardProps) {
  const navigate = useNavigate()
  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? '')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<TicketPrioridade>('media')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors<TicketField>>({})

  useEffect(() => {
    if (!clienteId && clientes[0]?.id) {
      setClienteId(clientes[0].id)
    }
  }, [clientes, clienteId])

  function clearFieldError(field: TicketField) {
    setErrors((prev) => {
      if (!prev[field] && !prev.form) return prev
      const next = { ...prev }
      delete next[field]
      delete next.form
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = { cliente_id: clienteId, titulo, descricao }
    const validation = validateTicketInput(payload)
    if (hasFieldErrors(validation)) {
      setErrors(validation)
      return
    }

    setSubmitting(true)
    setErrors({})
    try {
      await onCreate({
        cliente_id: clienteId,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade,
      })
      navigate('/chamados')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(mapTicketApiError(err))
      } else {
        setErrors({ form: 'Não foi possível criar o chamado. Tente novamente.' })
      }
    } finally {
      setSubmitting(false)
    }
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
        <form onSubmit={handleSubmit} noValidate>
          {errors.form && <FormAlert className="mb-4">{errors.form}</FormAlert>}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="ticket-cliente">Cliente</FieldLabel>
              <Select
                id="ticket-cliente"
                value={clienteId}
                onChange={(e) => {
                  setClienteId(e.target.value)
                  clearFieldError('cliente_id')
                }}
                aria-invalid={Boolean(errors.cliente_id)}
                className={cn(errors.cliente_id && 'border-red-400 focus-visible:ring-red-400')}
              >
                {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </Select>
              {errors.cliente_id && <FieldError>{errors.cliente_id}</FieldError>}
              {clientes.length === 0 && !errors.cliente_id && (
                <FieldError>Cadastre um cliente antes de abrir um chamado.</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="ticket-titulo">Título</FieldLabel>
              <Input
                id="ticket-titulo"
                placeholder="Resumo do problema"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value)
                  clearFieldError('titulo')
                }}
                aria-invalid={Boolean(errors.titulo)}
                className={cn('h-10 rounded-xl', errors.titulo && 'border-red-400 focus-visible:ring-red-400')}
              />
              {errors.titulo && <FieldError>{errors.titulo}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="ticket-descricao">Descrição</FieldLabel>
              <Textarea
                id="ticket-descricao"
                placeholder="Descreva o chamado com detalhes..."
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value)
                  clearFieldError('descricao')
                }}
                aria-invalid={Boolean(errors.descricao)}
                className={cn(errors.descricao && 'border-red-400 focus-visible:ring-red-400')}
                rows={4}
              />
              {errors.descricao && <FieldError>{errors.descricao}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="ticket-prioridade">Prioridade</FieldLabel>
              <Select
                id="ticket-prioridade"
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
            disabled={submitting}
            className="mt-4 h-11 w-full rounded-xl bg-[#00E676] font-semibold text-app-heading hover:bg-[#00cc66] disabled:opacity-50"
          >
            {submitting ? 'Criando...' : 'Criar chamado'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
