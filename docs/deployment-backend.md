# Deploy do backend (n8n) no Railway

Guia para hospedar o backend Bold Support em uma instancia n8n propria no Railway, **sem alterar o Supabase** (banco da aplicacao continua la).

## Arquitetura

```
Browser / Postman
       |
       v
  Railway (n8n)  ----webhooks---->  Supabase Postgres
       |                              (clientes, tickets,
       |                               agentes, app_config)
       v
  webhook.site (opcional, Etapa 2)
```

| Banco | Finalidade |
|-------|------------|
| **Postgres Railway** | Metadados do n8n (workflows, credenciais, execucoes) |
| **Supabase** | Dados da aplicacao (clientes, tickets, interacoes, agentes, app_config) |

> O Supabase **nao muda**. So apontamos os nodes Postgres dos workflows para a mesma credencial que voce ja usa hoje.

---

## Pre-requisitos

- Conta no [Railway](https://railway.app)
- Supabase com migrations `001`, `002` e `003` aplicadas
- Repositorio `Bold-Support` no GitHub (branch `main`)
- Postman ou `npm run test:api` para validar

---

## Passo 1 - Teste local (opcional, recomendado)

```bash
cd deploy/n8n
cp .env.example .env
# Edite N8N_ENCRYPTION_KEY no .env
docker compose up -d
```

Acesse http://localhost:5678, crie a conta owner e importe **um** workflow para validar.

---

## Passo 2 - Criar projeto no Railway

1. Acesse [railway.app/new](https://railway.app/new)
2. **Deploy from GitHub repo** -> selecione `Bold-Support`
3. O Railway detecta `railway.toml` na raiz e usa `deploy/n8n/Dockerfile`

---

## Passo 3 - Postgres interno do n8n

No projeto Railway:

1. **+ New** -> **Database** -> **PostgreSQL**
2. Esse banco e **so para o n8n** (nao e o Supabase da app)

---

## Passo 4 - Variaveis de ambiente do servico n8n

No servico n8n -> **Variables**. Use **Add Reference** para o Postgres Railway onde possivel.

### Obrigatorias

| Variavel | Valor |
|----------|-------|
| `N8N_ENCRYPTION_KEY` | String aleatoria longa (ex.: `openssl rand -hex 32`) - **nao perca** |
| `N8N_PORT` | `${{PORT}}` |
| `N8N_PROTOCOL` | `https` |
| `N8N_HOST` | `SEU-SERVICO.up.railway.app` (sem `https://`) |
| `WEBHOOK_URL` | `https://SEU-SERVICO.up.railway.app/` |
| `N8N_EDITOR_BASE_URL` | `https://SEU-SERVICO.up.railway.app/` |
| `DB_TYPE` | `postgresdb` |
| `DB_POSTGRESDB_HOST` | `${{Postgres.PGHOST}}` |
| `DB_POSTGRESDB_PORT` | `${{Postgres.PGPORT}}` |
| `DB_POSTGRESDB_DATABASE` | `${{Postgres.PGDATABASE}}` |
| `DB_POSTGRESDB_USER` | `${{Postgres.PGUSER}}` |
| `DB_POSTGRESDB_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `DB_POSTGRESDB_SCHEMA` | `public` |

### Recomendadas

| Variavel | Valor |
|----------|-------|
| `N8N_SECURE_COOKIE` | `true` |
| `GENERIC_TIMEZONE` | `America/Sao_Paulo` |
| `N8N_CORS_ORIGIN` | Dominios do Firebase (ver Passo 8) |
| `WEBHOOK_EXTERNO_URL` | URL do webhook.site (Etapa 2) |

> `N8N_HOST` e `WEBHOOK_URL` so ficam corretos **depois** de gerar o dominio (Passo 5). Faca um redeploy apos atualizar.

---

## Passo 5 - Dominio publico

1. Servico n8n -> **Settings** -> **Networking** -> **Generate Domain**
2. Anote a URL: `https://bold-support-production.up.railway.app`
3. Atualize `N8N_HOST`, `WEBHOOK_URL` e `N8N_EDITOR_BASE_URL` com essa URL
4. **Redeploy** o servico

**Base da API:**

```
https://SEU-SERVICO.up.railway.app/webhook
```

---

## Passo 6 - Primeiro acesso ao n8n

1. Abra `https://SEU-SERVICO.up.railway.app`
2. Crie a conta **owner** (email e senha do painel n8n - diferente do agente Bold)
3. Guarde essas credenciais

---

## Passo 7 - Configurar Supabase no n8n

### Credencial Postgres

1. **Credentials** -> **Postgres** -> **Create**
2. Nome sugerido: `Bold Support - Supabase`
3. Use o **Session Pooler** do Supabase:

| Campo | Valor |
|-------|-------|
| Host | `aws-0-<regiao>.pooler.supabase.com` |
| Port | `5432` |
| Database | `postgres` |
| User | `postgres.<project-ref>` |
| Password | senha do projeto |
| SSL | Allow |

### JWT secret (se ainda nao fez)

No Supabase SQL Editor:

```sql
UPDATE app_config
SET valor = 'sua-chave-longa-e-aleatoria-aqui'
WHERE chave = 'jwt_secret';
```

---

## Passo 8 - Importar e ativar workflows

### Opção A — script automatizado (recomendado)

```bash
cp .env.railway.example .env.railway
# Preencha N8N_BASE_URL e N8N_API_KEY (n8n → Settings → API)
npm run n8n:import
```

O script atualiza workflows existentes (PUT), preserva credenciais Postgres, remove duplicatas e ativa workflows inativos.

### Opção B — import manual

Importe **todos** os 11 JSONs de `n8n/workflows/`:

- `POST_Auth_Login.json`
- `POST_Clientes.json`, `GET_Clientes.json`, `GET_Cliente_por_ID.json`, `DELETE_Cliente_por_ID.json`
- `POST_Tickets.json`, `GET_Tickets.json`, `GET_Ticket_por_ID.json`, `DELETE_Ticket_por_ID.json`
- `PATCH_Ticket_Status.json`, `POST_Ticket_Interacao.json`

Em **cada** workflow:

1. Abra **todos** os nodes **Postgres** (incluindo `Buscar_jwt_secret`) -> selecione a credencial Supabase
2. Nos nodes de **busca** (`Buscar_cliente`, `Buscar_ticket`, etc.): **Always Output Data = ON**
3. **Ative** o workflow (toggle Active)
4. Copie a **Production URL** de cada webhook

### webhookIds usados pelo frontend

Algumas rotas incluem ID no path. O frontend ja esta preparado em `frontend/src/lib/api/client.ts`:

| Rota | webhookId |
|------|-----------|
| DELETE cliente | `bold-delete-cliente` |
| GET ticket por ID | `bold-get-ticket-id` |
| DELETE ticket | `bold-delete-ticket` |
| PATCH status | `bold-patch-ticket-status` |
| POST interacao | `bold-post-ticket-interacao` |

Se a Production URL do Railway seguir o mesmo padrao da instancia Bold (`/webhook/bold-xxx/...`), o frontend funciona sem alteracao.

---

## Passo 9 - CORS (necessario para o Firebase)

Quando o frontend estiver no Firebase, o browser chama o Railway em outro dominio. Configure:

```
N8N_CORS_ORIGIN=https://seu-projeto.web.app,https://seu-projeto.firebaseapp.com,http://localhost:5173
```

Redeploy apos adicionar.

---

## Passo 10 - Validar antes da apresentacao

### Postman

1. Environment `Bold Support - Producao` -> `base_url` = `https://SEU-SERVICO.up.railway.app/webhook`
2. Collection Etapa 4 -> **POST Login agente** -> deve retornar `access_token`
3. Collection Etapa 1 -> **GET clientes** com Bearer

### Newman (automático)

```bash
cp .env.test.example .env.test
# Edite API_BASE_URL para o dominio Railway
npm run test:api
```

### Checklist rapido

- [ ] Login retorna 200 + JWT
- [ ] GET clientes com Bearer retorna 200
- [ ] POST ticket cria protocolo
- [ ] PATCH status funciona
- [ ] `dev.boldsolution.com.br` continua funcionando (instancia antiga intacta)

---

## Troubleshooting

| Problema | Causa provavel | Solucao |
|----------|----------------|---------|
| 502 / healthcheck falha | `N8N_PORT` errado | Use `${{PORT}}` |
| Webhook 404 | Workflow inativo | Ative o workflow no n8n |
| 401 TOKEN_INVALIDO | `jwt_secret` diferente | Confira `app_config` no Supabase |
| CORS no browser | `N8N_CORS_ORIGIN` ausente | Adicione dominio Firebase |
| CORS `PATCH`/`DELETE` bloqueado (Firebase) | Bug n8n &lt; 1.109 em paths com `:id` | Atualize imagem para `n8nio/n8n:1.109.0+` e redeploy |
| Postgres node falha | Credencial errada | Session Pooler + SSL Allow |
| URL webhook errada | `WEBHOOK_URL` desatualizada | Atualize e redeploy |

---

## Proximo passo: Firebase (frontend)

Apos o backend validado no Railway, faça o deploy do console:

**Guia completo:** [deployment-frontend.md](deployment-frontend.md)

Produção atual: https://bold-support.web.app
