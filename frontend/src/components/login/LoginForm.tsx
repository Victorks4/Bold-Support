import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel, FormAlert } from '@/components/ui/field'
import { useAuth } from '@/lib/auth/AuthContext'
import { hasFieldErrors, validateLoginInput } from '@/lib/utils/form-validation'

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ReturnType<typeof validateLoginInput>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors = validateLoginInput({ email, senha })
    setErrors(nextErrors)
    if (hasFieldErrors(nextErrors)) return

    setLoading(true)
    try {
      await login(email.trim(), senha, lembrar)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Não foi possível entrar.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-card w-full rounded-2xl border border-gray-100 bg-white px-7 py-9 sm:px-8 sm:py-10">
      <header className="mb-8">
        <p className="mb-2 text-xs font-bold tracking-[0.12em] text-[#006AFE] uppercase">
          Bem-vindo de volta
        </p>
        <h1 className="mb-2 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0f172a]">
          Bold Support
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-gray-500">
          Console de atendimento para a equipe Bold.
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {errors.form ? <FormAlert>{errors.form}</FormAlert> : null}

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email" className="text-sm font-semibold text-[#0f172a]">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-gray-200 bg-white text-[0.9375rem] shadow-none focus-visible:border-[#006AFE] focus-visible:ring-[#006AFE]/15"
            />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="senha" className="text-sm font-semibold text-[#0f172a]">
              Senha
            </FieldLabel>
            <div className="relative">
              <Input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-11 rounded-xl border-gray-200 bg-white pr-11 text-[0.9375rem] shadow-none focus-visible:border-[#006AFE] focus-visible:ring-[#006AFE]/15"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.senha ? <FieldError>{errors.senha}</FieldError> : null}
          </Field>
        </FieldGroup>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#006AFE] focus:ring-[#006AFE]/30"
            />
            Lembrar-me
          </label>
          <button
            type="button"
            className="text-sm font-semibold text-[#006AFE] transition-colors hover:text-[#0058D6]"
          >
            Esqueci minha senha
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl bg-[#006AFE] text-[0.9375rem] font-semibold text-white shadow-sm hover:bg-[#0058D6] disabled:opacity-70"
        >
          {loading ? 'Entrando…' : 'Entrar'}
          {!loading ? <ArrowRight className="h-5 w-5" /> : null}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-400">
        Acesso protegido para equipes autorizadas.
      </p>
    </div>
  )
}
