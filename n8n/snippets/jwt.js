/**
 * Snippet JWT (HS256) para Code nodes do n8n.
 * Copie as funções necessárias para os nodes Gerar_JWT e Validar_JWT.
 * Configure JWT_SECRET (e opcionalmente JWT_EXPIRES_IN) nas variáveis de ambiente do n8n.
 */

const crypto = require('crypto')

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8')
  return buffer.toString('base64url')
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8')
}

function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

function verifyJwt(token, secret) {
  if (!token || !secret) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, signature] = parts
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  if (signature !== expected) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    if (payload.exp && Date.now() / 1000 > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

// --- Uso em Validar_JWT (proteção de rotas) ---
// const item = $input.first().json;
// const secret = $env.JWT_SECRET;
// const payload = verifyJwt(item.token, secret);
// return [{ json: { ...item, jwt_valid: !!payload, jwt_payload: payload } }];

// --- Uso em Gerar_JWT (login) ---
// const agente = $input.first().json;
// const secret = $env.JWT_SECRET;
// const expiresIn = Number($env.JWT_EXPIRES_IN || 3600);
// const now = Math.floor(Date.now() / 1000);
// const token = signJwt({ sub: agente.id, email: agente.email, nome: agente.nome, exp: now + expiresIn }, secret);
// return [{ json: { access_token: token, expires_in: expiresIn, agente: { id: agente.id, nome: agente.nome, email: agente.email } } }];

module.exports = { signJwt, verifyJwt, base64UrlEncode, base64UrlDecode }
