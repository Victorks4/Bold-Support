import { describe, expect, it } from 'vitest'
import { clampText, formatTelefoneDisplay, sanitizeTelefoneInput } from './input-masks'

describe('sanitizeTelefoneInput', () => {
  it('remove caracteres não numéricos e limita a 11 dígitos', () => {
    expect(sanitizeTelefoneInput('(11) 99999-8888')).toBe('11999998888')
    expect(sanitizeTelefoneInput('11 99999 8888 77')).toBe('11999998888')
  })
})

describe('formatTelefoneDisplay', () => {
  it('formata celular com 11 dígitos', () => {
    expect(formatTelefoneDisplay('11999998888')).toBe('(11) 99999-8888')
  })
})

describe('clampText', () => {
  it('limita texto ao máximo informado', () => {
    expect(clampText('abcdef', 3)).toBe('abc')
  })
})
