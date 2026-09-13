# API — Bold Support (Etapas 1 e 2)

Backend em **n8n** (instância Bold Solution).

**Produção** (workflows ativos):

```
https://dev.boldsolution.com.br/webhook
```

**Teste** (Listen for test event por request):

```
https://dev.boldsolution.com.br/webhook-test
```

Na instância hospedada, a URL de produção inclui o `webhookId` de cada workflow:

| Workflow | URL de produção |
|----------|-----------------|
| `PATCH_Ticket_Status.json` | `/webhook/bold-patch-ticket-status/tickets/atualizar-status/:id` |
| `POST_Ticket_Interacao.json` | `/webhook/bold-post-ticket-interacao/tickets/adicionar-interacao/:id` |
| `DELETE_Ticket_por_ID.json` | `/webhook/bold-delete-ticket/tickets/remover/:id` |
| `DELETE_Cliente_por_ID.json` | `/webhook/bold-delete-cliente/clientes/remover/:id` |

> Paths únicos são obrigatórios no n8n — rotas da Etapa 2 usam prefixos (`remover`, `atualizar-status`, `adicionar-interacao`) para não conflitar com GET da Etapa 1.

Autenticação: **não implementada** (Etapa 4).

Contrato OpenAPI: [`openapi.yaml`](openapi.yaml)

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

**201 — Sucesso:**

```json
{
  "id": "uuid",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999998888",
  "criado_em": "2026-09-10T12:00:00.000Z"
}
```

**400 — Erros:**

| codigo | Condição |
|--------|----------|
| `NOME_INVALIDO` | Nome ausente ou > 150 chars |
| `EMAIL_INVALIDO` | E-mail inválido |
| `TELEFONE_OBRIGATORIO` | Telefone ausente |

---

### GET /clientes/:id

**Workflow:** `GET_Cliente_por_ID.json`

Retorna dados de um cliente pelo UUID.

**Exemplo:** `GET /clientes/18695f4c-43be-4646-83dd-98c55ca9c90f`

**200 — Sucesso:** objeto `Cliente` (mesmos campos do POST).

**400:** `ID_INVALIDO` — UUID malformado.

**404:** `CLIENTE_NAO_ENCONTRADO` — UUID válido, cliente inexistente.

---

### DELETE /clientes/remover/:id

**Workflow:** `DELETE_Cliente_por_ID.json`

Remove um cliente **somente se não houver tickets vinculados** (`ON DELETE RESTRICT`).

**200 — Sucesso:**

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

### POST /tickets

**Workflow:** `POST_Tickets.json`

Cria ticket vinculado a um cliente. Gera protocolo `TKT-YYYYMMDD-XXXX`, status `aberto` e uma interação automática do tipo `sistema`.

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

**201 — Sucesso:** objeto ticket completo (`id`, `protocolo`, `cliente_id`, `titulo`, `descricao`, `prioridade`, `status`, `criado_em`, `atualizado_em`).

**400 — Erros:**

| codigo | Condição |
|--------|----------|
| `CLIENTE_ID_INVALIDO` | UUID inválido |
| `TITULO_INVALIDO` | Título ausente ou > 200 chars |
| `DESCRICAO_OBRIGATORIA` | Descrição vazia |
| `PRIORIDADE_INVALIDA` | Valor fora do enum |

**404:** `CLIENTE_NAO_ENCONTRADO` — cliente_id não existe no banco.

---

### GET /tickets

**Workflow:** `GET_Tickets.json`

Lista tickets com **ao menos um** filtro na query string.

**Exemplos:**

```
GET /tickets?status=aberto
GET /tickets?prioridade=alta
GET /tickets?status=aberto&prioridade=alta
```

| Query | Valores |
|-------|---------|
| `status` | `aberto`, `em_atendimento`, `aguardando_cliente`, `resolvido`, `cancelado` |
| `prioridade` | `baixa`, `media`, `alta` |

**200 — Sucesso:**

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

**400 — Erros:**

| codigo | Condição |
|--------|----------|
| `FILTRO_OBRIGATORIO` | Sem `status` nem `prioridade` |
| `STATUS_INVALIDO` | Status fora do enum |
| `PRIORIDADE_INVALIDA` | Prioridade fora do enum |

---

### GET /tickets/:id

**Workflow:** `GET_Ticket_por_ID.json`

Retorna ticket com array `interacoes` ordenado por `criado_em` ASC.

**200 — Sucesso:**

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

**200 — Sucesso:**

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

**200 — Sucesso:** objeto `Ticket` atualizado.

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
| `resolvido` | — (terminal) |
| `cancelado` | — (terminal) |

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

**201 — Sucesso:** objeto `Interacao` criado.

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

- `Bold-Support.postman_collection.json` — rotas da Etapa 2
- `Bold-Support.postman_environment.json` — `base_url` = `https://dev.boldsolution.com.br/webhook`

Importe a collection e o environment no Postman. Preencha `cliente_id` e `ticket_id` com UUIDs válidos do banco.

Para modo teste n8n (`/webhook-test`), altere `base_url` e use **Listen for test event** antes de cada request.
