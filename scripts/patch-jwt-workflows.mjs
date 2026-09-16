import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const workflowsDir = join(process.cwd(), 'n8n', 'workflows')

const EXTRair_CODE = `const item = $input.first().json;
const headers = item.headers ?? {};
const auth = headers.authorization ?? headers.Authorization ?? '';
const match = /^Bearer\\s+(.+)$/i.exec(auth);
return [{ json: { ...item, token: match ? match[1].trim() : null } }];`

const VALIDAR_CODE = `const crypto = require('crypto');
const item = $input.first().json;
const token = item.token;
const secret = $env.JWT_SECRET;

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

function verifyJwt(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(\`\${encodedHeader}.\${encodedPayload}\`)
    .digest('base64url');
  if (signature !== expected) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

const payload = verifyJwt(token, secret);
return [{ json: { ...item, jwt_valid: !!payload, jwt_payload: payload } }];`

function makeJwtNodes(workflowName, webhookPos) {
  const prefix = workflowName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  const x = webhookPos[0]
  const y = webhookPos[1]
  return [
    {
      parameters: { jsCode: EXTRair_CODE },
      id: `${prefix}-extrair-token`,
      name: 'Extrair_token',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [x + 220, y],
    },
    {
      parameters: { jsCode: VALIDAR_CODE },
      id: `${prefix}-validar-jwt`,
      name: 'Validar_JWT',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [x + 440, y],
    },
    {
      parameters: {
        conditions: {
          options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
          conditions: [
            {
              id: 'cond-jwt-valid',
              leftValue: '={{ $json.jwt_valid }}',
              rightValue: true,
              operator: { type: 'boolean', operation: 'true' },
            },
          ],
          combinator: 'and',
        },
        options: {},
      },
      id: `${prefix}-token-valido`,
      name: 'Token_valido?',
      type: 'n8n-nodes-base.if',
      typeVersion: 2,
      position: [x + 660, y],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: "={{ { erro: 'Token inválido ou expirado', codigo: 'TOKEN_INVALIDO' } }}",
        options: { responseCode: 401 },
      },
      id: `${prefix}-respond-401`,
      name: 'Responde_401',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [x + 880, y + 180],
    },
  ]
}

function patchWorkflow(filePath) {
  const raw = readFileSync(filePath, 'utf8')
  const workflow = JSON.parse(raw)

  if (workflow.nodes.some((n) => n.name === 'Extrair_token')) {
    console.log(`skip (already patched): ${workflow.name}`)
    return
  }

  const webhook = workflow.nodes.find((n) => n.name === 'Webhook_1')
  if (!webhook) {
    console.log(`skip (no Webhook_1): ${workflow.name}`)
    return
  }

  const nextNode = workflow.connections?.Webhook_1?.main?.[0]?.[0]?.node
  if (!nextNode) {
    console.log(`skip (no connection): ${workflow.name}`)
    return
  }

  const jwtNodes = makeJwtNodes(workflow.name, webhook.position)
  workflow.nodes.push(...jwtNodes)

  workflow.connections.Webhook_1 = {
    main: [[{ node: 'Extrair_token', type: 'main', index: 0 }]],
  }
  workflow.connections.Extrair_token = {
    main: [[{ node: 'Validar_JWT', type: 'main', index: 0 }]],
  }
  workflow.connections.Validar_JWT = {
    main: [[{ node: 'Token_valido?', type: 'main', index: 0 }]],
  }
  workflow.connections['Token_valido?'] = {
    main: [
      [{ node: nextNode, type: 'main', index: 0 }],
      [{ node: 'Responde_401', type: 'main', index: 0 }],
    ],
  }

  writeFileSync(filePath, JSON.stringify(workflow, null, 2) + '\n', 'utf8')
  console.log(`patched: ${workflow.name} -> ${nextNode}`)
}

for (const file of readdirSync(workflowsDir).filter((f) => f.endsWith('.json'))) {
  if (file === 'POST_Auth_Login.json') continue
  patchWorkflow(join(workflowsDir, file))
}
