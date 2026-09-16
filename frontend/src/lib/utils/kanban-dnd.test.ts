import { describe, expect, it } from 'vitest'
import { canDropInColumn, resolveDropStatus } from '@/lib/utils/kanban-dnd'

describe('resolveDropStatus', () => {
  it('permite transição válida de aberto para em_atendimento', () => {
    expect(resolveDropStatus('em_atendimento', 'aberto')).toBe('em_atendimento')
  })

  it('bloqueia transição inválida de aberto para resolvido', () => {
    expect(resolveDropStatus('resolvido', 'aberto')).toBeNull()
  })

  it('resolve encerrados para resolvido quando permitido', () => {
    expect(resolveDropStatus('encerrados', 'em_atendimento')).toBe('resolvido')
  })

  it('retorna null quando status não mudaria', () => {
    expect(resolveDropStatus('aberto', 'aberto')).toBeNull()
  })
})

describe('canDropInColumn', () => {
  it('retorna true para drop válido', () => {
    expect(canDropInColumn('em_atendimento', 'aberto')).toBe(true)
  })

  it('retorna false para drop inválido', () => {
    expect(canDropInColumn('resolvido', 'aberto')).toBe(false)
  })
})
