# Bold Support - Frontend

Console de atendimento para agentes Bold. React 19 + Vite 8 + Tailwind 4 + Framer Motion.

## Rodar localmente

```bash
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

Login em `/` com autenticação JWT real (Etapa 4).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview do build local |
| `npm test` | Vitest em modo watch |
| `npm run test:run` | Vitest uma vez |
| `npm run test:coverage` | Cobertura de código |

## Rotas

| Rota | Tela |
|------|------|
| `/` | Login |
| `/dashboard` | Visão geral do atendimento |
| `/fila` | Kanban - 4 colunas (incl. Encerrados) |
| `/chamados` | Lista completa com filtros |
| `/chamados/:id` | Detalhe + timeline de interações |
| `/clientes` | Cadastro de cliente + abrir chamado |
| `/eventos` | Log de eventos (mutações API + webhook.site opcional) |

## Estrutura de pastas

```
frontend/src/
├── App.tsx                 # Rotas e providers
├── pages/                  # Telas por rota
│   ├── DashboardPage.tsx
│   ├── QueuePage.tsx
│   ├── TicketsPage.tsx
│   ├── TicketDetailPage.tsx
│   ├── ClientsPage.tsx
│   └── EventsPage.tsx
├── components/
│   ├── layout/             # AppShell, Sidebar, TopBar, MobileNav
│   ├── dashboard/          # StatCard, RecentEventsCard, VolumeChart
│   ├── queue/              # KanbanBoard, KanbanCard
│   ├── tickets/            # TicketTable, TicketCardList, badges
│   ├── clients/            # ClientRegisterCard, TicketCreateCard
│   ├── events/             # EventLog
│   ├── login/              # LoginPage, LoginForm, LoginLeftPanel
│   ├── motion/             # PageTransition
│   └── ui/                 # Button, Input, Select, Card, Badge...
├── lib/
│   ├── store/              # AppDataContext (estado + API n8n)
│   ├── api/                # client.ts, clientes.ts, tickets.ts, webhook-site.ts
│   ├── types/              # Cliente, Ticket, WebhookEvento
│   ├── utils/              # dashboard-metrics, kanban-dnd, time
│   ├── theme/              # ThemeProvider (claro/escuro)
│   ├── assets.ts           # LOGO_SRC, SIDEBAR_LOGO_SRC
│   └── logger.ts           # Log de ações do agente
└── styles/
    ├── app.css             # Shell, sidebar, logo hover
    └── login.css           # Tela de login
```

## Layout responsivo

- **Desktop (`lg+`):** sidebar lateral (240px, colapsável via botão no header)
- **Mobile/tablet (`< lg`):** bottom navigation fixa + TopBar com notificações e avatar à direita
- **Chamados:** tabela em `md+`, cards empilhados em mobile

## Tema claro/escuro

- `ThemeProvider` em `lib/theme/ThemeProvider.tsx` - persiste preferência em `localStorage`
- Toggle na sidebar (rodapé) via `ThemeToggle`
- Classes utilitárias em `styles/app.css` (`text-app-heading`, etc.)

## Assets

| Arquivo | Uso |
|---------|-----|
| `public/images/boldiconsidebar.png` | Logo na sidebar (`SIDEBAR_LOGO_SRC`) |
| `public/images/logobold.png` | Logo no login e TopBar mobile |
| `public/images/boldfavicon.png` | Favicon do sistema |
| `public/videos/boldsupport.mp4` | Vídeo do painel esquerdo do login |

Constantes em `src/lib/assets.ts`.

## Modelo de uso

O **agente** cadastra clientes e abre chamados em nome deles. Não há portal self-service para o cliente final. Interações tipo `cliente` representam o que foi dito por outros canais (e-mail, telefone, etc.).

## Integração n8n

`AppDataContext` carrega clientes e tickets da API no bootstrap (`Promise.allSettled`). Mutations (criar cliente/ticket, status, interação) chamam os workflows n8n via `lib/api/`.

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_N8N_WEBHOOK_BASE_URL` | Base dos webhooks (`/webhook` com proxy Vite em dev) |
| `VITE_WEBHOOK_SITE_TOKEN` | (Opcional) UUID webhook.site para polling em `/eventos` |

Mapeamento de URLs (path + `webhookId` onde necessário) em `src/lib/api/client.ts`. Copie a Production URL de cada workflow no n8n se algo retornar 404.

Métricas do dashboard: `lib/utils/dashboard-metrics.ts`. Ordenação por prioridade: `lib/utils/ticket-sort.ts`.

## Validação de formulários

| Campo | Limite |
|-------|--------|
| Telefone (cliente) | 10–11 dígitos, máscara `(11) 99999-9999` |
| Descrição do chamado | 1000 caracteres |
| Interações (agente/cliente) | 1000 caracteres |
| Título do chamado | 200 caracteres |

Constantes em `src/lib/constants/field-limits.ts`. Máscaras em `src/lib/utils/input-masks.ts`.

## Performance e acessibilidade

- **Lazy loading** de páginas (`React.lazy` + `Suspense`) — bundle inicial menor
- **Code splitting** — `vendor-react` e `vendor-motion` separados no build
- **`prefers-reduced-motion`** — animações desativadas quando o usuário solicita
- Contadores de caracteres com `aria-describedby` nos formulários
- Polling webhook.site a cada 60s (evita rate limit)

## Deploy (Firebase)

```bash
npm run build
cd .. && firebase deploy --only hosting --project bold-support
```

Ver [docs/deployment-frontend.md](../docs/deployment-frontend.md).

## Motion

- **Framer Motion:** transições de página, stagger no dashboard, sidebar ativa, kanban, timeline (respeita `prefers-reduced-motion`)
