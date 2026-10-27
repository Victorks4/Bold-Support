"""Gera docs/apresentacao-bold-support.docx — guia de apresentação do desafio."""

from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "apresentacao-bold-support.docx"


def add_title(doc: Document, text: str) -> None:
    p = doc.add_heading(text, level=0)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER


def add_h1(doc: Document, text: str) -> None:
    doc.add_heading(text, level=1)


def add_h2(doc: Document, text: str) -> None:
    doc.add_heading(text, level=2)


def add_para(doc: Document, text: str, bold: bool = False) -> None:
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold


def add_bullets(doc: Document, items: list[str]) -> None:
    for item in items:
        doc.add_paragraph(item, style="List Bullet")


def add_table(doc: Document, headers: list[str], rows: list[list[str]]) -> None:
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = h
        for p in hdr[i].paragraphs:
            for r in p.runs:
                r.bold = True
    for ri, row in enumerate(rows):
        cells = table.rows[ri + 1].cells
        for ci, val in enumerate(row):
            cells[ci].text = val
    doc.add_paragraph()


def main() -> None:
    doc = Document()

    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    add_title(doc, "Bold Support")
    add_para(doc, "Guia de Apresentação — Desafio Técnico Bold Solution", bold=True)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("Victor — Bold Support")
    run.font.color.rgb = RGBColor(0x00, 0x6A, 0xFE)

    doc.add_paragraph()

    add_h1(doc, "Links de produção")
    add_bullets(
        doc,
        [
            "App: https://bold-support.web.app",
            "API: https://your-service.up.railway.app/webhook",
            "Repositório: github.com/Victorks4/Bold-Support",
            "Login teste: agente@bold.com / Bold@2026",
        ],
    )

    add_h1(doc, "1. Pitch de abertura (30 segundos)")
    add_para(
        doc,
        'Construí o Bold Support como um sistema de chamados full stack: backend em n8n '
        "com 11 workflows independentes, banco PostgreSQL, autenticacao JWT, "
        "console do agente em React, testes automatizados com Vitest e Newman, e deploy "
        "em produção no Railway (backend) e Firebase (frontend).",
    )

    add_h1(doc, "2. Roteiro sugerido (12–15 minutos)")
    add_table(
        doc,
        ["Tempo", "Bloco", "O que mostrar"],
        [
            ["1 min", "Contexto", "Problema: suporte precisa cadastrar clientes, abrir chamados, fila, histórico, integração externa"],
            ["2 min", "Arquitetura", "Browser -> Firebase (SPA) -> Railway (n8n) -> PostgreSQL"],
            ["2 min", "Banco", "clientes, tickets, interações, agentes, app_config; constraints e regras"],
            ["4 min", "Workflows n8n", "Padrão + exemplos (criar ticket, PATCH status, JWT)"],
            ["2 min", "Frontend", "Telas, AppDataContext, integração API"],
            ["2 min", "Deploy & Docker", "Railway, Dockerfile, CORS, Firebase"],
            ["1 min", "Testes", "47 Vitest + Newman Etapas 4→1→2"],
            ["2 min", "Demo ao vivo", "Login → dashboard → chamado → kanban → interação → eventos"],
        ],
    )

    add_h1(doc, "3. Arquitetura")
    add_para(
        doc,
        "Frase-chave: Firebase entrega o front; n8n e o backend HTTP; PostgreSQL da app e a fonte da verdade; "
        "o Postgres do Railway existe so para o proprio n8n funcionar.",
    )
    add_bullets(
        doc,
        [
            "[React SPA] → Firebase Hosting (arquivos estáticos)",
            "Browser → API HTTPS → Railway (n8n :5678)",
            "n8n -> PostgreSQL (dados da app)",
            "n8n → webhook.site (eventos externos, opcional)",
            "Railway Postgres → metadados do n8n (workflows, credenciais)",
        ],
    )

    add_h1(doc, "4. Banco de dados")
    add_table(
        doc,
        ["Tabela", "Função"],
        [
            ["clientes", "Quem abre chamado"],
            ["tickets", "Protocolo, status, prioridade"],
            ["interacoes", "Timeline (sistema, cliente, agente)"],
            ["agentes", "Login JWT (senha com crypt)"],
            ["app_config", "jwt_secret para assinar/validar token"],
        ],
    )
    add_h2(doc, "Regras importantes")
    add_bullets(
        doc,
        [
            "Cliente com tickets → DELETE bloqueado (409 CLIENTE_POSSUI_TICKETS)",
            "Excluir ticket → CASCADE nas interações",
            "Status com máquina de estados (não é update livre)",
            "Protocolo gerado no Code node do n8n",
        ],
    )
    add_h2(doc, "Transições de status")
    add_table(
        doc,
        ["Status atual", "Pode ir para"],
        [
            ["aberto", "em_atendimento, cancelado"],
            ["em_atendimento", "aguardando_cliente, resolvido, cancelado"],
            ["aguardando_cliente", "em_atendimento, resolvido, cancelado"],
            ["resolvido / cancelado", "terminal (sem transições)"],
        ],
    )

    add_h1(doc, "5. Workflows n8n (11 rotas)")
    add_para(doc, "Conceito: cada rota HTTP é um workflow isolado — facilita revisão, debug e demonstração na avaliação.")
    add_h2(doc, "Padrão (rotas protegidas)")
    add_para(
        doc,
        "Webhook_1 → Extrair_token → Validar_JWT → IF → Validar_payload → IF → Postgres → Responde_*",
    )
    add_h2(doc, "Lista de workflows")
    add_table(
        doc,
        ["Arquivo", "Rota", "Auth"],
        [
            ["POST_Auth_Login.json", "POST /auth/login", "Pública"],
            ["GET_Clientes.json", "GET /clientes", "JWT"],
            ["POST_Clientes.json", "POST /clientes", "JWT"],
            ["GET_Cliente_por_ID.json", "GET /clientes/id/:id", "JWT"],
            ["DELETE_Cliente_por_ID.json", "DELETE /clientes/remover/:id", "JWT"],
            ["POST_Tickets.json", "POST /tickets/criar", "JWT"],
            ["GET_Tickets.json", "GET /tickets/listar", "JWT"],
            ["GET_Ticket_por_ID.json", "GET /tickets/id/:id", "JWT"],
            ["PATCH_Ticket_Status.json", "PATCH /tickets/atualizar-status/:id", "JWT"],
            ["POST_Ticket_Interacao.json", "POST /tickets/adicionar-interacao/:id", "JWT"],
            ["DELETE_Ticket_por_ID.json", "DELETE /tickets/remover/:id", "JWT"],
        ],
    )
    add_h2(doc, "Convenções")
    add_bullets(
        doc,
        [
            "Nodes em Snake_case (Validar_payload, Responde_404)",
            "Webhook sempre Webhook_1",
            "Erros: { erro, codigo }",
            "SQL parametrizado ($1, $2) — anti SQL injection",
            "Postgres de busca: Always Output Data = ON",
            "JWT em JS puro (n8n/snippets/jwt-pure-inline.js)",
        ],
    )
    add_h2(doc, "Exemplo: POST_Tickets (abrir chamado)")
    add_bullets(
        doc,
        [
            "Valida cliente_id, titulo, descricao",
            "Busca cliente — 404 se não existe",
            "Gera protocolo no Code node",
            "INSERT ticket + INSERT interação tipo sistema",
            "Responde 201 com o ticket",
        ],
    )
    add_h2(doc, "Exemplo: PATCH_Ticket_Status")
    add_bullets(
        doc,
        [
            "Valida UUID e enum de status",
            "Valida transição permitida (matriz)",
            "UPDATE status + atualizado_em",
            "Insere interação sistema",
            "Dispara webhook externo (status_alterado)",
            "Responde 200",
        ],
    )
    add_h2(doc, "Webhook externo (Etapa 2)")
    add_bullets(
        doc,
        [
            "Eventos: status_alterado, interacao_adicionada, ticket_excluido",
            'Payload: { "protocolo", "evento", "status" }',
            "continueOnFail — falha não bloqueia a API",
            "POST interação: responde 201 antes; webhook em paralelo",
        ],
    )

    add_h1(doc, "6. Frontend")
    add_table(
        doc,
        ["Rota", "Tela"],
        [
            ["/", "Login JWT"],
            ["/dashboard", "Métricas e visão geral"],
            ["/fila", "Kanban 4 colunas + drag-and-drop"],
            ["/chamados", "Lista com filtros"],
            ["/chamados/:id", "Detalhe + timeline"],
            ["/clientes", "Cadastro + abrir chamado"],
            ["/eventos", "Log + webhook.site opcional"],
        ],
    )
    add_h2(doc, "Camadas")
    add_bullets(
        doc,
        [
            "AuthContext — login, logout, sessão",
            "AppDataContext — bootstrap API, CRUD, eventos",
            "lib/api/client.ts — Bearer, URLs com webhookId",
            "ticket-parse.ts — normaliza respostas da API",
            "Atualização otimista ao registrar interações",
            "Code splitting, tema claro/escuro, responsivo",
        ],
    )
    add_para(doc, "Escopo consciente: produto é console do agente Bold — sem portal self-service do cliente.")

    add_h1(doc, "7. Docker e Railway")
    add_para(doc, "Dockerfile: FROM n8nio/n8n:1.123.80 — corrige CORS em PATCH/DELETE com :id no path.")
    add_h2(doc, "Variáveis críticas no Railway")
    add_bullets(
        doc,
        [
            "N8N_ENCRYPTION_KEY — não perder",
            "WEBHOOK_URL / N8N_HOST — domínio público",
            "N8N_CORS_ORIGIN — domínios Firebase + localhost",
            "DB_POSTGRESDB_* — Postgres interno do n8n",
            "Credencial Postgres nos workflows aponta para o PostgreSQL da app",
        ],
    )
    add_para(doc, "Import workflows: npm run n8n:import (usa .env.railway)")

    add_h1(doc, "8. Testes")
    add_table(
        doc,
        ["Suite", "Ferramenta", "Resultado"],
        [
            ["Frontend", "Vitest + Testing Library", "47 testes"],
            ["API Etapa 4", "Newman", "Login JWT"],
            ["API Etapa 1", "Newman", "CRUD"],
            ["API Etapa 2", "Newman", "PATCH, interação, DELETE"],
        ],
    )
    add_para(doc, "Comandos: npm test | npm run test:frontend | npm run test:api")

    add_h1(doc, "9. Script da demo ao vivo (2–3 min)")
    add_bullets(
        doc,
        [
            "1. Login com agente@bold.com",
            "2. Dashboard — métricas em tempo real",
            "3. Cadastrar cliente",
            "4. Abrir chamado",
            "5. Fila (kanban) — mudar status",
            "6. Detalhe — nota do agente + registro do cliente",
            "7. Eventos / webhook.site",
        ],
    )
    add_h2(doc, "Pré-demo (5 min antes)")
    add_bullets(
        doc,
        [
            "Abrir app em aba anônima",
            "Abrir n8n no Railway (editor)",
            "Abrir webhook.site",
            "Ter npm run test:api como plano B",
        ],
    )
    add_h2(doc, "Se algo falhar")
    add_table(
        doc,
        ["Sintoma", "Resposta"],
        [
            ["401", "Token expirou — logout e login"],
            ["Workflow 404", "Workflow precisa estar ativo no n8n"],
            ["CORS", "N8N_CORS_ORIGIN configurado para Firebase"],
            ["Tela antiga", "Ctrl+Shift+R (cache)"],
        ],
    )

    add_h1(doc, "10. Perguntas frequentes na avaliação")
    add_h2(doc, "Por que n8n e não NestJS/Express?")
    add_para(doc, "Exigência do desafio Bold. Ganho: orquestração visual, um workflow por rota. Trade-off: paths com webhookId e sandbox JS limitado.")
    add_h2(doc, "Como garante segurança?")
    add_para(doc, "JWT em todas as rotas exceto login; senha com crypt() no Postgres; SQL parametrizado; secrets em app_config e variáveis de ambiente.")
    add_h2(doc, "Por que dois Postgres?")
    add_para(doc, "Railway = metadados do n8n. PostgreSQL da app = dados da aplicacao Bold Support.")
    add_h2(doc, "E se o webhook externo cair?")
    add_para(doc, "continueOnFail — operação principal já foi feita; API responde sucesso independente.")
    add_h2(doc, "Qual foi o bug mais difícil?")
    add_para(
        doc,
        "Interações sumindo após refresh (parseTicket não preservava interacoes) + POST interação lento "
        "(webhook bloqueando → corrigido com resposta 201 antes e update otimista no frontend).",
    )
    add_h2(doc, "Como organizou as entregas?")
    add_para(doc, "Branches stage/01 a stage/04 congeladas por etapa; main com tudo integrado; docs e testes por etapa.")

    add_h1(doc, "11. Branches Git")
    add_table(
        doc,
        ["Branch", "Etapa"],
        [
            ["stage/01-core-api", "API básica (5 rotas)"],
            ["stage/02-ticket-operations", "DELETE, PATCH, webhook"],
            ["stage/03-frontend", "Console React"],
            ["stage/04-authentication", "JWT"],
            ["main", "Tudo integrado"],
        ],
    )

    add_h1(doc, "12. O que será avaliado (resumo)")
    add_bullets(
        doc,
        [
            "Domínio técnico e decisões arquiteturais",
            "Workflows n8n — padrão, validação, regras de negócio",
            "Modelagem do banco e constraints",
            "Frontend integrado com API real",
            "Autenticação JWT end-to-end",
            "Deploy (Docker, Railway, Firebase, CORS)",
            "Testes automatizados e documentação",
            "Demo ao vivo fluida",
            "Organização do repositório (branches por etapa)",
        ],
    )

    add_h1(doc, "13. Fechamento (30 segundos)")
    add_para(
        doc,
        "Entreguei as 4 etapas com branches separadas, documentação completa, testes automatizados "
        "passando e deploy em produção. O sistema cobre o ciclo do agente: autenticar, cadastrar, "
        "abrir chamado, operar na fila, registrar interações e notificar sistemas externos — com "
        "regras de negócio no backend e UX polida no frontend. Estou pronto para evoluir isso em "
        "produção real na Bold.",
    )

    add_h1(doc, "14. Checklist de estudo (véspera da apresentação)")
    add_h2(doc, "Noite anterior")
    add_bullets(
        doc,
        [
            "Ensaiar pitch de 30s e demo de 3 min em voz alta",
            "Abrir 3 workflows no n8n: POST_Tickets, PATCH_Ticket_Status, POST_Auth_Login",
            "Memorizar matriz de transições de status",
            "Memorizar diferenca Railway Postgres vs PostgreSQL da app",
            "Saber explicar JWT: login → token → Bearer → Validar_JWT",
        ],
    )
    add_h2(doc, "1 hora antes")
    add_bullets(
        doc,
        [
            "Rodar npm test",
            "Login no app + um fluxo completo",
            "Revisar docs/entregas.md",
            "Abas prontas: app, n8n, webhook.site, GitHub",
        ],
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUTPUT)
    print(f"Gerado: {OUTPUT}")


if __name__ == "__main__":
    main()
