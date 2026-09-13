import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, Headphones } from 'lucide-react'
import { BoldBrand } from './BoldBrand'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 flex justify-center px-2 lg:hidden">
        <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white px-4 py-3.5 shadow-lg shadow-black/10">
          <BoldBrand />
        </div>
      </div>

      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-black">Acessar o sistema</h2>
        <p className="text-gray-500">Digite suas credenciais para entrar no Bold Support</p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email" className="text-gray-700">
              Email
            </FieldLabel>
            <div className="group relative">
              <User
                className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-black"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neon-input-glow h-12 border-2 border-gray-200 pl-12 text-base transition-all focus:border-gray-500 focus:ring-gray-500/20"
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="senha" className="text-gray-700">
              Senha
            </FieldLabel>
            <div className="group relative">
              <Lock
                className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-black"
                aria-hidden
              />
              <Input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="neon-input-glow h-12 border-2 border-gray-200 pl-12 text-base transition-all focus:border-gray-500 focus:ring-gray-500/20"
              />
            </div>
          </Field>
        </FieldGroup>

        <motion.div
          className="w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.986 }}
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
        >
          <Button
            type="button"
            className="neon-login-submit h-12 w-full cursor-pointer border border-blue-500/34 bg-gradient-to-br from-[#2875f0] to-[#2061d9] text-base font-semibold text-white transition-[box-shadow,color] hover:from-[#2e7efb] hover:to-[#2567ea]"
          >
            Entrar
            <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
          </Button>
        </motion.div>
      </form>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-cyan-200/80 bg-blue-50/60 p-3 shadow-[0_0_20px_-8px_var(--neon-glow-cyan)]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2875f0] to-[#2061d9] text-white">
          <Headphones className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-left text-sm leading-snug text-blue-950/85">
          Após o login, agentes gerenciam chamados e clientes acompanham o protocolo em tempo real.
        </p>
      </div>
    </div>
  )
}
