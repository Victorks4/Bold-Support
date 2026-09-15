import { useState } from 'react'
import { Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import type { Cliente } from '@/lib/types/cliente'

type ClientRegisterCardProps = {
  onAdd: (input: { nome: string; email: string; telefone: string }) => void | Promise<unknown>
  recentClientes: Cliente[]
  countTickets: (id: string) => number
  getInitials: (nome: string) => string
}

const avatarColors = ['blue', 'green', 'purple', 'orange', 'teal'] as const

export function ClientRegisterCard({
  onAdd,
  recentClientes,
  countTickets,
  getInitials,
}: ClientRegisterCardProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !telefone.trim()) return
    await onAdd({ nome: nome.trim(), email: email.trim(), telefone: telefone.trim() })
    setNome('')
    setEmail('')
    setTelefone('')
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <User className="h-4 w-4 text-[#006AFE]" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider text-[#006AFE] uppercase">Etapa 01</p>
            <p className="text-sm font-bold text-app-heading">Cadastrar cliente</p>
            <p className="text-app-muted text-xs">Crie um novo contato na sua base.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Nome</FieldLabel>
                <Input
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Telefone</FieldLabel>
              <Input
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="h-10 rounded-xl"
              />
            </Field>
          </FieldGroup>
          <Button
            type="submit"
            variant="outline"
            className="mt-4 h-10 w-full rounded-xl border-gray-200 font-semibold"
          >
            <Plus className="h-4 w-4" />
            Adicionar cliente
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
          <p className="mb-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            Clientes recentes
          </p>
          <div className="space-y-3">
            {recentClientes.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold bg-${avatarColors[i % avatarColors.length]}-100 text-[#006AFE]`}
                    style={{
                      backgroundColor: ['#DBEAFE', '#D1FAE5', '#EDE9FE', '#FFEDD5', '#CCFBF1'][i % 5],
                      color: ['#006AFE', '#059669', '#7C3AED', '#EA580C', '#0D9488'][i % 5],
                    }}
                  >
                    {getInitials(c.nome)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-app-heading">{c.nome}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {countTickets(c.id)} chamado{countTickets(c.id) !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
