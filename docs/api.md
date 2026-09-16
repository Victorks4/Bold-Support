# API - Bold Support (Etapas 1–4)

Backend em **n8n** (instância Bold Solution).

**Produção** (workflows ativos):

```
https://dev.boldsolution.com.br/webhook
```

**Teste** (Listen for test event por request):

```
https://dev.boldsolution.com.br/webhook-test
```

Na instância hospedada, copie a **Production URL** de cada workflow no node `Webhook_1`. O formato pode variar:

| Workflow | URL de produção (instância Bold) |
|----------|----------------------------------|
| `GET_Clientes.json` | `/webhook/clientes` |
| `GET_Cliente_por_ID.json` | `/webhook/clientes/id/:id` |
| `POST_Clientes.json` | `/webhook/clientes` |
| `POST_Tickets.json` | `/webhook/tickets/criar` |
| `GET_Tickets.json` | `/webhook/tickets/listar` |
| `GET_Ticket_por_ID.json` | `/webhook/bold-get-ticket-id/tickets/id/:id` |
| `PATCH_Ticket_Status.json` | `/webhook/bold-patch-ticket-status/tickets/atualizar-status/:id` |
| `POST_Ticket_Interacao.json` | `/webhook/bold-post-ticket-interacao/tickets/adicionar-interacao/:id` |
| `DELETE_Ticket_por_ID.json` | `/webhook/bold-delete-ticket/tickets/remover/:id` |
| `DELETE_Cliente_por_ID.json` | `/webhook/bold-delete-cliente/clientes/remover/:id` |
| `POST_Auth_Login.json` | `/webhook/auth/login` |

> Alguns workflows registram só o **path**; outros incluem o **Webhook ID** no meio da URL. Use sempre a Production URL exibida no n8n.

> Paths únicos são obrigatórios no n8n - rotas da Etapa 2 usam prefixos (`remover`, `atualizar-status`, `adicionar-interacao`) para não conflitar com GET da Etapa 1.

## Autenticação (Etapa 4)

Todas as rotas exigem header `Authorization: Bearer <access_token>`, **exceto** `POST /auth/login`.

| Código HTTP | `codigo` | Quando |
|-------------|----------|--------|
| 401 | `CREDENCIAIS_INVALIDAS` | E-mail ou senha incorretos no login |
| 401 | `TOKEN_INVALIDO` | Token ausente, expirado ou assinatura inválida |

O token é JWT HS256 gerado no n8n (chave `jwt_secret` na tabela `app_config` do Postgres). Payload: `sub` (id do agente), `email`, `nome`, `exp`.

Contrato OpenAPI: [`openapi.yaml`](openapi.yaml)

---

## Auth

### POST /auth/login

**Workflow:** `POST_Auth_Login.json` (rota **pública**)

Autentica um agente Bold e retorna JWT.

**Body (JSON):**

```json
{
  "email": "agente@bold.com",
  "senha": "Bold@2026"
}
```

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| `email` | Sim | Formato e-mail válido |
| `senha` | Sim | Não vazio |

**200 - Sucesso:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "agente": {
    "id": "uuid",
    "nome": "Agente Teste",
    "email": "agente@bold.com"
  }
}
```

**401 - Credenciais inválidas:**

```json
{
  "erro": "Credenciais inválidas",
  "codigo": "CREDENCIAIS_INVALIDAS"
}
```

**400 - Validação:**

```json
{
  "erro": "Email inválido",
  "codigo": "EMAIL_INVALIDO"
}
```

---

## Formato de erro

Todas as respostas de erro seguem:

```json
{
  "erro": "Mensagem legível",
  "codigo": "CODIGO_CONSTANTE"
}
```

---

## Clientes

### POST /clientes

**Workflow:** `POST_Clientes.json`

Cadastra um novo cliente.

**Body (JSON):**

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999998888"
}
```

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| `nome` | Sim | 1–150 caracteres |
| `email` | Sim | Formato e-mail válido |
| `telefone` | Sim | Não vazio |

**201 - Sucesso:**

```json
{
  "id": "uuid",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999998888",
  "criado_em": "2026-09-10T12:00:00.000Z"
}
```

**400 - Erros:**

| codigo | Condição |
|--------|----------|
| `NOME_INVALIDO` | Nome ausente ou > 150 chars |
| `EMAIL_INVALIDO` | E-mail inválido |
| `TELEFONE_OBRIGATORIO` | Telefone ausente |

---

### GET /clientes

**Workflow:** `GET_Clientes.json`

Lista todos os clientes cadastrados, ordenados por `criado_em` DESC.

**200 - Sucesso:**

```json
{
  "total": 2,
  "clientes": [
    {
      "id": "uuid",
      "nome": "Maria Silva",
      "email": "maria@email.com",
      "telefone": "11999998888",
      "criado_em": "2026-09-10T12:00:00.000Z"
    }
  ]
}
```

---

### GET /clientes/id/:id

**Workflow:** `GET_Cliente_por_ID.json`

Retorna dados de um cliente pelo UUID.

> Path `clientes/id/:id` evita conflito com `GET /clientes` (listagem) no n8n.

**Exemplo:** `GET /clientes/id/18695f4c-43be-4646-83dd-98c55ca9c90f`

**200 - Sucesso:** objeto `Cliente` (mesmos campos do POST).

**400:** `ID_INVALIDO` - UUID malformado.

**404:** `CLIENTE_NAO_ENCONTRADO` - UUID válido, cliente inexistente.

---

### DELETE /clientes/remover/:id

**Workflow:** `DELETE_Cliente_por_ID.json`

Remove um cliente **somente se não houver tickets vinculados** (`ON DELETE RESTRICT`).

**200 - Sucesso:**

```json
{
  "mensagem": "Cliente removido com sucesso",
  "cliente": {
    "id": "uuid",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "11999998888"
  }
}
```

| HTTP | codigo | Condição |
|------|--------|----------|
| 400 | `ID_INVALIDO` | UUID malformado |
| 404 | `CLIENTE_NAO_ENCONTRADO` | Cliente inexistente |
| 409 | `CLIENTE_POSSUI_TICKETS` | Cliente com tickets ativos |

---

## Tickets

### POST /tickets/criar

**Workflow:** `POST_Tickets.json`

Cria ticket vinculado a um cliente.

> Path `tickets/criar` evita conflito com o webhook legado em `tickets` (workflow antigo inacessível na instância). Gera protocolo `TKT-YYYYMMDD-XXXX`, status `aberto` e uma interação automática do tipo `sistema`.

**Body (JSON):**

```json
{
  "cliente_id": "uuid-do-cliente",
  "titulo": "Erro no login",
  "descricao": "Não consigo acessar o sistema",
  "prioridade": "alta"
}
```

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| `cliente_id` | Sim | UUID válido |
| `titulo` | Sim | 1–200 caracteres |
| `descricao` | Sim | Não vazio |
| `prioridade` | Não | `baixa`, `media`, `alta` (default: `media`) |

**201 - Sucesso:** objeto ticket completo (`id`, `protocolo`, `cliente_id`, `titulo`, `descricao`, `prioridade`, `status`, `criado_em`, `atualizado_em`).

**400 - Erros:**

| codigo | Condição |
|--------|----------|
| `CLIENTE_ID_INVALIDO` | UUID inválido |
| `TITULO_INVALIDO` | Título ausente ou > 200 chars |
| `DESCRICAO_OBRIGATORIA` | Descrição vazia |
| `PRIORIDADE_INVALIDA` | Valor fora do enum |

**404:** `CLIENTE_NAO_ENCONTRADO` - cliente_id não existe no banco.

---

### GET /tickets/listar

**Workflow:** `GET_Tickets.json`

Lista tickets com **ao menos um** filtro na query string.

> Path `tickets/listar` evita conflito com `POST /tickets/criar` no n8n.

**Exemplos:**

```
GET /tickets/listar?status=aberto
GET /tickets/listar?prioridade=alta
GET /tickets/listar?status=aberto&prioridade=alta
```

| Query | Valores |
|-------|---------|
| `status` | `aberto`, `em_atendimento`, `aguardando_cliente`, `resolvido`, `cancelado` |
| `prioridade` | `baixa`, `media`, `alta` |

**200 - Sucesso:**

```json
{
  "total": 1,
  "filtros": { "status": "aberto", "prioridade": null },
  "tickets": [
    {
      "id": "uuid",
      "protocolo": "TKT-20260910-XXXX",
      "cliente_id": "uuid",
      "titulo": "Erro no login",
      "descricao": "...",
      "prioridade": "alta",
      "status": "aberto",
      "criado_em": "...",
      "atualizado_em": "..."
    }
  ]
}
```

**400 - Erros:**

| codigo | Condição |
|--------|----------|
| `FILTRO_OBRIGATORIO` | Sem `status` nem `prioridade` |
| `STATUS_INVALIDO` | Status fora do enum |
| `PRIORIDADE_INVALIDA` | Prioridade fora do enum |

---

### GET /tickets/id/:id

**Workflow:** `GET_Ticket_por_ID.json`

Retorna ticket com array `interacoes` ordenado por `criado_em` ASC.

> Path `tickets/id/:id` evita conflito com `POST /tickets/criar` e `GET /tickets/listar` no n8n.

**Exemplo:** `GET /tickets/id/92845250-3a28-4821-9df1-8f3fdca47377`

**200 - Sucesso:**

```json
{
  "id": "uuid",
  "protocolo": "TKT-20260910-XXXX",
  "cliente_id": "uuid",
  "titulo": "Erro no login",
  "descricao": "...",
  "prioridade": "alta",
  "status": "aberto",
  "criado_em": "...",
  "atualizado_em": "...",
  "interacoes": [
    {
      "id": "uuid",
      "ticket_id": "uuid",
      "tipo": "sistema",
      "mensagem": "Ticket aberto automaticamente pelo sistema.",
      "criado_em": "..."
    }
  ]
}
```

**400:** `ID_INVALIDO`

**404:** `TICKET_NAO_ENCONTRADO`

---

### DELETE /tickets/remover/:id

**Workflow:** `DELETE_Ticket_por_ID.json`

Remove o ticket e suas interações (`ON DELETE CASCADE`). Dispara webhook externo com evento `ticket_excluido`.

**200 - Sucesso:**

```json
{
  "mensagem": "Ticket removido com sucesso",
  "ticket": {
    "id": "uuid",
    "protocolo": "TKT-20260910-XXXX",
    "status": "aberto"
  }
}
```

| HTTP | codigo | Condição |
|------|--------|----------|
| 400 | `ID_INVALIDO` | UUID malformado |
| 404 | `TICKET_NAO_ENCONTRADO` | Ticket inexistente |

---

### PATCH /tickets/atualizar-status/:id

**Workflow:** `PATCH_Ticket_Status.json`

Atualiza o status do ticket com validação de transições permitidas. Registra interação automática do tipo `sistema` e dispara webhook externo com evento `status_alterado`.

**Body (JSON):**

```json
{
  "status": "em_atendimento"
}
```

**200 - Sucesso:** objeto `Ticket` atualizado.

| HTTP | codigo | Condição |
|------|--------|----------|
| 400 | `ID_INVALIDO` | UUID malformado |
| 400 | `STATUS_INVALIDO` | Status fora do enum |
| 400 | `STATUS_IGUAL` | Novo status igual ao atual |
| 400 | `TRANSICAO_INVALIDA` | Transição não permitida |
| 404 | `TICKET_NAO_ENCONTRADO` | Ticket inexistente |

#### Transições permitidas

| Status atual | Pode ir para |
|--------------|--------------|
| `aberto` | `em_atendimento`, `cancelado` |
| `em_atendimento` | `aguardando_cliente`, `resolvido`, `cancelado` |
| `aguardando_cliente` | `em_atendimento`, `resolvido`, `cancelado` |
| `resolvido` | - (terminal) |
| `cancelado` | - (terminal) |

---

### POST /tickets/adicionar-interacao/:id

**Workflow:** `POST_Ticket_Interacao.json`

Adiciona mensagem ao histórico do ticket. Atualiza `atualizado_em` do ticket. Dispara webhook externo com evento `interacao_adicionada`.

**Body (JSON):**

```json
{
  "tipo": "cliente",
  "mensagem": "Enviei o comprovante por e-mail."
}
```

| Campo | Obrigatório | Regras |
|-------|-------------|--------|
| `tipo` | Sim | `cliente` ou `agente` |
| `mensagem` | Sim | Não vazio |

**201 - Sucesso:** objeto `Interacao` criado.

| HTTP | codigo | Condição |
|------|--------|----------|
| 400 | `ID_INVALIDO` | UUID malformado |
| 400 | `TIPO_INVALIDO` | Tipo fora de `cliente`/`agente` |
| 400 | `MENSAGEM_OBRIGATORIA` | Mensagem vazia |
| 404 | `TICKET_NAO_ENCONTRADO` | Ticket inexistente |

---

## Integração HTTP externa

Workflows que disparam notificação para sistema externo (mock):

| Workflow | Evento | Quando |
|----------|--------|--------|
| `PATCH_Ticket_Status.json` | `status_alterado` | Após atualizar status |
| `DELETE_Ticket_por_ID.json` | `ticket_excluido` | Após excluir ticket |
| `POST_Ticket_Interacao.json` | `interacao_adicionada` | Após nova interação |

**Payload enviado (POST JSON):**

```json
{
  "protocolo": "TKT-20260910-XXXX",
  "evento": "status_alterado",
  "status": "em_atendimento"
}
```

Configure a URL em `WEBHOOK_EXTERNO_URL` (ex.: [webhook.site](https://webhook.site)). Falha no webhook **não** impede a resposta da API (`continueOnFail`).

---

## Testes com Postman

Arquivos em `postman/`:

| Arquivo | Uso |
|---------|-----|
| `Bold-Support-Etapa-1.postman_collection.json` | Etapa 1 - modo teste (`/webhook-test` + Listen) |
| `Bold-Support-Etapa-2.postman_collection.json` | Etapa 2 - produção (`/webhook` + webhookId onde aplicável) |
| `Bold-Support.postman_environment.json` | `base_url`, `cliente_id`, `ticket_id` |

**Produção:** `base_url` = `https://dev.boldsolution.com.br/webhook`

**Teste n8n:** altere `base_url` para `https://dev.boldsolution.com.br/webhook-test` e use **Listen for test event** antes de cada request.

> Algumas rotas usam só o path (`/webhook/clientes`); outras incluem webhookId (`/webhook/bold-get-ticket-id/tickets/id/:id`). Use a tabela de URLs acima ou copie a Production URL de cada workflow no n8n.
