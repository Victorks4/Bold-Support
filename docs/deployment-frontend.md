# Deploy do frontend (Firebase Hosting)

Console do agente em produção: **https://bold-support.web.app**

## Arquitetura

```
Browser (Firebase Hosting)
       |
       |  HTTPS /webhook/*
       v
  Railway (n8n)
       |
       v
  Supabase Postgres
```

O Firebase serve apenas arquivos estáticos (`frontend/dist`). Toda a API passa pelo n8n no Railway.

---

## Pré-requisitos

- Node.js 20+
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`)
- Login: `firebase login`
- Backend n8n no Railway ativo (ver [deployment-backend.md](deployment-backend.md))

---

## Variáveis de build

Arquivo `frontend/.env.production` (versionado — contém apenas URLs públicas):

```env
VITE_N8N_WEBHOOK_BASE_URL=https://bold-support-production.up.railway.app/webhook
VITE_WEBHOOK_SITE_TOKEN=<uuid-do-webhook.site>
```

| Variável | Descrição |
|----------|-----------|
| `VITE_N8N_WEBHOOK_BASE_URL` | Base dos webhooks n8n em produção |
| `VITE_WEBHOOK_SITE_TOKEN` | (Opcional) UUID webhook.site para sincronizar `/eventos` |

---

## Build e deploy

Na raiz do repositório:

```bash
cd frontend
npm install
npm run build

cd ..
firebase deploy --only hosting --project bold-support
```

Atalho a partir da raiz (após `npm install` no frontend):

```bash
npm run build --prefix frontend
firebase deploy --only hosting --project bold-support
```

---

## CORS no Railway

O browser chama o Railway a partir do domínio Firebase. Configure no serviço n8n:

```
N8N_CORS_ORIGIN=https://bold-support.web.app,https://bold-support.firebaseapp.com,http://localhost:5173
```

Use n8n **1.109+** para PATCH/DELETE em rotas com `:id` (já configurado em `deploy/n8n/Dockerfile`).

---

## Arquivos de configuração

| Arquivo | Função |
|---------|--------|
| `firebase.json` | Hosting: `public: frontend/dist`, SPA rewrite, cache de assets |
| `.firebaserc` | Projeto Firebase `bold-support` |

A pasta `.firebase/` é cache local do CLI — não commitar (está no `.gitignore`).

---

## Checklist pós-deploy

- [ ] Login em https://bold-support.web.app com agente de teste
- [ ] Dashboard carrega clientes e chamados
- [ ] Criar cliente / chamado / alterar status
- [ ] Eventos em `/eventos` e webhook.site recebem POST do n8n
- [ ] Hard refresh (Ctrl+Shift+R) se assets antigos em cache

---

## Desenvolvimento local

```bash
cd frontend
cp .env.example .env
npm run dev    # http://localhost:5173 — proxy /webhook → dev ou Railway
```

Ver [installation.md](installation.md) e [frontend/README.md](../frontend/README.md).
