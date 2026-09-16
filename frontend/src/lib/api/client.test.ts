import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  apiFetch,
  buildWebhookUrl,
  setUnauthorizedHandler,
} from '@/lib/api/client'
import * as tokenStorage from '@/lib/auth/token-storage'

describe('buildWebhookUrl', () => {
  it('combina base e path sem barras duplicadas', () => {
    expect(buildWebhookUrl('clientes')).toMatch(/\/clientes$/)
    expect(buildWebhookUrl('/auth/login')).toMatch(/\/auth\/login$/)
  })
})

describe('ApiError', () => {
  it('expõe codigo e status', () => {
    const err = new ApiError('Falha', 'ERRO_TESTE', 400)
    expect(err.message).toBe('Falha')
    expect(err.codigo).toBe('ERRO_TESTE')
    expect(err.status).toBe(400)
  })
})

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    setUnauthorizedHandler(null)
    vi.restoreAllMocks()
  })

  it('retorna JSON em resposta 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: true }),
      }),
    )
    vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue('token-test')

    const data = await apiFetch<{ ok: boolean }>('https://api.test/clientes')
    expect(data.ok).toBe(true)
  })

  it('lança ApiError em resposta de erro', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({ erro: 'E-mail inválido', codigo: 'EMAIL_INVALIDO' }),
      }),
    )

    await expect(apiFetch('https://api.test/clientes')).rejects.toMatchObject({
      codigo: 'EMAIL_INVALIDO',
      status: 400,
    })
  })

  it('dispara unauthorizedHandler em 401 TOKEN_INVALIDO', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({ erro: 'Token inválido', codigo: 'TOKEN_INVALIDO' }),
      }),
    )

    await expect(apiFetch('https://api.test/clientes')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('lança ApiError para resposta HTML do n8n', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => '<!DOCTYPE html><html><body>erro</body></html>',
      }),
    )

    await expect(apiFetch('https://api.test/clientes')).rejects.toMatchObject({
      codigo: 'RESPOSTA_INVALIDA',
    })
  })
})
