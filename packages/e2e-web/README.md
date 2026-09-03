# Agroscope Web — Testes de Sistema (Playwright)

Suíte de **testes de sistema** (system tests): caixa-preta, ponta a ponta, contra
a stack completa (nginx → Next.js → NestJS → Postgres/RabbitMQ), automatizando
os 35 casos de teste de [`Casos_de_Teste_Agroscope.md`](../../Casos_de_Teste_Agroscope.md).

Só a parte **web** foi automatizada aqui (Playwright + Chromium), conforme
combinado — o app mobile (Expo) fica de fora.

Feito para **não precisar rodar no seu computador**: suba num servidor, numa VM,
num runner de CI ou em qualquer outra máquina com Docker e Node. Tudo abaixo já
está pronto — só falta executar.

## O que roda de verdade vs. o que é mockado

O backend sobe com `MOCK_AI=true`, então **toda a stack roda de verdade**
(login real, upload real, banco real, WebSocket real) — só a análise de IA e as
respostas do chat vêm de serviços mockados (`MockPredictService` /
`MockAiAgentService`, que já existem no próprio backend), porque os serviços
externos reais (Flask de classificação de imagem, N8N) não fazem parte deste
repositório.

## Pré-requisitos

- Docker + Docker Compose
- Node.js 20+
- ~2GB livres de RAM para a stack (Postgres + RabbitMQ + backend + frontend + nginx) e mais um pouco para o Chromium do Playwright

## Passo a passo

```bash
# 1. Na raiz do repositório: sobe a stack completa de teste
docker compose -f docker-compose.test.yml up -d --build

# 2. Instala as dependências e o Chromium do Playwright
cd packages/e2e-web
npm install
npm run install-browsers

# 3. (opcional) copie .env.example para .env se for rodar em outra máquina/portas
cp .env.example .env

# 4. Roda a suíte inteira
npm test

# Ver o relatório HTML depois
npm run report

# 5. Ao terminar, derruba a stack (o -v remove o volume do Postgres também)
cd ../..
docker compose -f docker-compose.test.yml down -v
```

Cada teste cria seus próprios dados (usuários com e-mail único por execução),
então a suíte pode rodar várias vezes seguidas sobre o mesmo Postgres sem
precisar resetar nada entre execuções.

### Rodando um subconjunto

```bash
npx playwright test tests/auth          # só autenticação
npx playwright test -g "CT-17"          # só um caso específico
npx playwright test --headed            # com o browser visível (útil pra debugar)
npx playwright test --ui                # modo interativo do Playwright
```

## Por que `BASE_URL=http://localhost` importa

O backend seta o cookie de sessão com `Secure` + `SameSite=None`. Isso só
funciona em HTTP (sem TLS) quando o host é **exatamente** `localhost` — é uma
exceção que os browsers Chromium dão pra esse host específico. Se a stack de
teste rodar em outra máquina, publique as portas e acesse via túnel/proxy de
forma que o Playwright ainda enxergue a aplicação em `http://localhost` (por
exemplo, `ssh -L 80:localhost:80 -L 5433:localhost:5433 usuario@maquina-remota`
antes de rodar os testes localmente). Usar o IP da máquina ou outro hostname
faz o cookie de autenticação ser silenciosamente descartado pelo browser, e
todo teste autenticado quebra de forma confusa (parece bug de login, mas é
política de cookies do browser).

## Cobertura: 35 casos de teste, 29 automatizados, 6 sinalizados como `fixme`

Todos os 35 CTs de `Casos_de_Teste_Agroscope.md` têm um teste correspondente.
29 rodam de verdade contra o sistema real. 6 foram implementados mas marcados
com `test.fixme(...)` — o código já está escrito (pronto para ativar assim que
a causa raiz for resolvida), mas eles não rodam hoje porque o cenário que
descrevem não é alcançável no sistema atual:

| CT | Motivo do `fixme` |
|----|--------------------|
| CT-18 — planta saudável | `MockPredictService.ts` tem o fluxo "saudável" desativado no código (`const isHealthy = false`), com um comentário do próprio time explicando um bug pré-existente de constraint `NOT NULL` na coluna `crop` do histórico |
| CT-21 — cultura não suportada | O mock sempre identifica uma das 3 culturas conhecidas (Tomate/Milho/Soja); não simula "nenhuma cultura identificada" |
| CT-22 — imagem corrompida | O mock nunca valida os bytes da imagem enviada, então não há como provocar esse erro sem o serviço real de IA |
| CT-23 — baixa confiança | O mock sempre retorna confiança fixa alta (92–96%); o caminho de baixa confiança só é alcançável trocando a implementação do `PredictService`, não pela UI |
| CT-25 — sem plano ativo | `CreateUser.usecase.ts` atribui o plano FREE automaticamente a **todo** cadastro novo, e não existe rota para remover o plano de um usuário — esse estado simplesmente não é alcançável hoje pelo sistema real |
| CT-29 — confirmar/contestar diagnóstico | Não existe essa funcionalidade nem na UI (`/history`, `/history/[id]`) nem na API (`core.controller.ts` só expõe leitura de histórico) |

Nenhum desses é um problema do Playwright ou da suíte — são lacunas reais entre
o que `Casos_de_Teste_Agroscope.md` descreve e o que o produto faz hoje. Rodar
`npx playwright test` mostra esses 6 como "fixme" no relatório, não como
falha silenciosa nem como sucesso forjado.

## Detalhes de implementação que valem saber

- **Arranjo de dados via API real**: para não repetir manualmente pela UI cada
  pré-condição que não é o foco do caso de teste (ex.: "usuário com 3 análises
  no histórico"), os testes chamam a própria API HTTP do backend
  (`support/api-client.ts`) para cadastrar usuários, fazer login e rodar
  análises antes de abrir o browser. Isso continua sendo um teste de sistema
  de ponta a ponta — só evita repetir passos de setup que já têm teste próprio
  (login, cadastro) em todo outro arquivo.
- **`support/db.ts` é a única exceção de caixa-preta pura**: os testes de
  recuperação de senha (CT-08/09/10) precisam do código de 6 dígitos que, na
  vida real, vai por e-mail — e este ambiente não tem um mail-catcher
  configurado. Esse arquivo lê a tabela `authentication` direto do Postgres
  só para isso (a mesma solução que os testes e2e do próprio backend usam,
  só que fora do processo do Nest). O resto da suíte é 100% HTTP/UI.
- **`support/chat-socket.ts`**: usado só para *arranjar* o cenário de limite
  de chat esgotado (CT-34), mandando 50 mensagens via Socket.IO direto (fora
  do browser) antes de abrir a UI — digitar 50 mensagens manualmente pela UI
  seria só desperdício de tempo de execução, sem valor de teste adicional.
- **Sem `data-testid`s no frontend hoje** — os seletores usam labels, texto
  visível e `role` ARIA. Funciona, mas é mais frágil a mudanças de copy/layout
  do que `data-testid`s seriam. Vale considerar adicionar alguns nos elementos
  interativos principais (campos de formulário, botão de enviar, "Ver
  detalhes", "Contratar") se a manutenção desses testes começar a doer.
- **CT-17 e o histórico/chat**: o `MockPredictService` sorteia aleatoriamente
  entre 3 doenças a cada análise — os testes checam a *estrutura* do
  resultado (cultura identificada, diagnóstico, causas, manejo preenchidos),
  não um cenário fixo. O teste de filtro por cultura (CT-27) lida com essa
  aleatoriedade lendo o que realmente foi gerado via API antes de filtrar
  pela UI, em vez de assumir qual cultura vai aparecer.
