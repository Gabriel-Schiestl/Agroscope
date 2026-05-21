# Casos de Teste — Agroscope

> **Projeto:** Agroscope — Plataforma de diagnóstico agrícola com IA  
> **Autor:** Gabriel Schiestl  
> **Pacotes cobertos:** Backend (NestJS), Frontend Web (Next.js), App Mobile (Expo), IA (Flask)  
> **Convenção de ID:** CT-XX por módulo sequencial

---

## Sumário de Módulos

| Faixa | Módulo |
|-------|--------|
| CT-01 a CT-10 | Autenticação (Auth) |
| CT-11 a CT-15 | Usuário (User) |
| CT-16 a CT-23 | Análise de Imagem / Predição |
| CT-24 a CT-30 | Histórico (History) |
| CT-31 a CT-35 | Chat |
| CT-36 | Planos (Plan) |
| CT-37 a CT-43 | Serviço de IA (Flask) |
| CT-44 a CT-53 | Frontend Web (Next.js) |
| CT-54 a CT-64 | App Mobile (Expo) |

---

## Módulo: Autenticação

---

### CT-01 — Login com credenciais válidas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que um usuário cadastrado consegue autenticar com e-mail e senha corretos |
| **Pré-condições** | Usuário cadastrado no sistema; API backend em execução |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Enviar `POST /auth/login` com corpo `{ "email": "usuario@email.com", "password": "senha@123" }` |
| **Resultado esperado** | HTTP 200 com token JWT criptografado no corpo da resposta |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-02 — Login com senha incorreta

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema recusa login com senha errada |
| **Pré-condições** | Usuário cadastrado no sistema |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha_errada` |
| **Procedimentos** | 1. Enviar `POST /auth/login` com senha incorreta |
| **Resultado esperado** | HTTP 400/401 com mensagem de erro; contador de tentativas incrementado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-03 — Bloqueio de conta após 5 tentativas inválidas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a conta é bloqueada após 5 tentativas de login com senha errada |
| **Pré-condições** | Usuário cadastrado; 4 tentativas incorretas já registradas |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha_errada` (5ª tentativa) |
| **Procedimentos** | 1. Enviar `POST /auth/login` com senha incorreta pela 5ª vez <br> 2. Tentar login novamente com senha correta |
| **Resultado esperado** | Após a 5ª tentativa: HTTP 403 indicando conta bloqueada; login com senha correta também negado enquanto bloqueado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-04 — Solicitar token de recuperação de senha

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema gera e envia um token de 6 dígitos ao e-mail do usuário |
| **Pré-condições** | Usuário cadastrado com e-mail válido; serviço de e-mail configurado |
| **Dados de entrada** | E-mail: `usuario@email.com` |
| **Procedimentos** | 1. Enviar `POST /auth/recovery-token` com `{ "email": "usuario@email.com" }` |
| **Resultado esperado** | HTTP 200; e-mail recebido com código de 6 dígitos; código expira em 5 minutos |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-05 — Validar token de recuperação correto

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema aceita um token de recuperação válido e não expirado |
| **Pré-condições** | Token de recuperação gerado e não expirado |
| **Dados de entrada** | E-mail: `usuario@email.com` / Token: `123456` (código válido recebido) |
| **Procedimentos** | 1. Enviar `POST /auth/validate-recovery-token` com `{ "email": "usuario@email.com", "token": "123456" }` |
| **Resultado esperado** | HTTP 200 indicando token válido; permite prosseguir para alteração de senha |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-06 — Validar token de recuperação incorreto

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema recusa token de recuperação inválido e incrementa tentativas incorretas |
| **Pré-condições** | Token de recuperação gerado; menos de 4 tentativas incorretas |
| **Dados de entrada** | E-mail: `usuario@email.com` / Token: `000000` (código errado) |
| **Procedimentos** | 1. Enviar `POST /auth/validate-recovery-token` com token incorreto |
| **Resultado esperado** | HTTP 400 com mensagem de erro; contador de tentativas incorretas incrementado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-07 — Validar token de recuperação expirado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema rejeita token expirado (após 5 minutos) |
| **Pré-condições** | Token de recuperação gerado há mais de 5 minutos |
| **Dados de entrada** | E-mail: `usuario@email.com` / Token: código expirado |
| **Procedimentos** | 1. Aguardar mais de 5 min após geração do token <br> 2. Enviar `POST /auth/validate-recovery-token` com o código |
| **Resultado esperado** | HTTP 400 com mensagem informando que o token expirou |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-08 — Alterar senha com token válido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o usuário consegue alterar a senha após validar o token de recuperação |
| **Pré-condições** | Token de recuperação validado com sucesso |
| **Dados de entrada** | E-mail: `usuario@email.com` / Nova senha: `novaSenha@456` |
| **Procedimentos** | 1. Enviar `POST /auth/change-password` com `{ "email": "usuario@email.com", "newPassword": "novaSenha@456" }` <br> 2. Tentar login com a nova senha |
| **Resultado esperado** | HTTP 200; login com nova senha realizado com sucesso |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-09 — Obter token CSRF

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o endpoint público de CSRF retorna um token válido |
| **Pré-condições** | API backend em execução |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Enviar `GET /auth/csrf/token` sem autenticação |
| **Resultado esperado** | HTTP 200 com token CSRF no corpo da resposta |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-10 — Validar sessão autenticada

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o endpoint `/auth/validate` retorna dados corretos para sessão ativa |
| **Pré-condições** | Usuário autenticado com token JWT válido |
| **Dados de entrada** | Token JWT no cookie/header de autorização |
| **Procedimentos** | 1. Enviar `GET /auth/validate` com token de autenticação válido |
| **Resultado esperado** | HTTP 200 com `{ isEngineer, isAdmin, name, email }` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Usuário

---

### CT-11 — Criar usuário com dados válidos

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que um novo usuário é criado com sucesso com dados válidos |
| **Pré-condições** | E-mail não cadastrado no sistema |
| **Dados de entrada** | Nome: `João Silva` / E-mail: `joao@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Enviar `POST /user` com `{ "name": "João Silva", "email": "joao@email.com", "password": "senha@123" }` |
| **Resultado esperado** | HTTP 201; usuário criado; evento `user.created` emitido; autenticação criada automaticamente |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-12 — Criar usuário com e-mail já cadastrado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema impede cadastro com e-mail duplicado |
| **Pré-condições** | Usuário com e-mail `joao@email.com` já cadastrado |
| **Dados de entrada** | Nome: `Outro Nome` / E-mail: `joao@email.com` / Senha: `outraSenha@123` |
| **Procedimentos** | 1. Enviar `POST /user` com e-mail já existente |
| **Resultado esperado** | HTTP 400/409 com mensagem de conflito de e-mail |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-13 — Criar usuário com campos obrigatórios ausentes

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema rejeita criação de usuário sem campos obrigatórios |
| **Pré-condições** | API backend em execução |
| **Dados de entrada** | Corpo: `{ "email": "joao@email.com" }` (sem nome e senha) |
| **Procedimentos** | 1. Enviar `POST /user` sem os campos `name` e `password` |
| **Resultado esperado** | HTTP 400 com mensagem descrevendo quais campos são obrigatórios |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-14 — Criar usuário com e-mail em formato inválido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema rejeita e-mails em formato inválido |
| **Pré-condições** | API backend em execução |
| **Dados de entrada** | Nome: `João` / E-mail: `emailinvalido` / Senha: `senha@123` |
| **Procedimentos** | 1. Enviar `POST /user` com e-mail sem formato válido |
| **Resultado esperado** | HTTP 400 com mensagem de validação de formato de e-mail |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-15 — Consultar limites de uso do usuário

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o endpoint de limites retorna as informações de uso atuais do usuário |
| **Pré-condições** | Usuário autenticado com plano associado |
| **Dados de entrada** | Token de autenticação válido |
| **Procedimentos** | 1. Enviar `GET /limit` com token autenticado |
| **Resultado esperado** | HTTP 200 com `{ imageRequests, imageLimit, chatRequests, chatLimit }` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Análise de Imagem / Predição

---

### CT-16 — Analisar imagem válida de planta doente

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o fluxo completo de análise para uma imagem de planta com doença identificável |
| **Pré-condições** | Usuário autenticado com plano ativo e limite disponível; serviço IA em execução |
| **Dados de entrada** | Arquivo: `milho_doente.jpg` (imagem de milho com ferrugem) / Localização: opcional |
| **Procedimentos** | 1. Enviar `POST /predict` com imagem em `multipart/form-data` <br> 2. Verificar resposta com dados de doença |
| **Resultado esperado** | HTTP 200 com `{ crop, cropConfidence, sickness, sicknessConfidence, handling, causes, explanation, precautions }`; limite de imagens incrementado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-17 — Analisar imagem de planta saudável

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema identifica corretamente uma planta saudável |
| **Pré-condições** | Usuário autenticado com plano ativo e limite disponível |
| **Dados de entrada** | Arquivo: `soja_saudavel.jpg` (imagem de soja sem doença) |
| **Procedimentos** | 1. Enviar `POST /predict` com imagem de planta saudável |
| **Resultado esperado** | HTTP 200 com indicação de planta saudável e handling mínimo; histórico salvo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-18 — Enviar requisição de análise sem arquivo

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema rejeita a análise quando nenhuma imagem é enviada |
| **Pré-condições** | Usuário autenticado |
| **Dados de entrada** | Corpo vazio ou multipart sem campo `image` |
| **Procedimentos** | 1. Enviar `POST /predict` sem arquivo de imagem |
| **Resultado esperado** | HTTP 400 com mensagem indicando que a imagem é obrigatória |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-19 — Enviar arquivo com tipo inválido para análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema rejeita arquivos que não são imagens |
| **Pré-condições** | Usuário autenticado |
| **Dados de entrada** | Arquivo: `documento.pdf` (arquivo PDF) |
| **Procedimentos** | 1. Enviar `POST /predict` com um arquivo `.pdf` no campo de imagem |
| **Resultado esperado** | HTTP 400 com mensagem de tipo de arquivo não suportado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-20 — Análise com confiança abaixo do limiar (< 0.8)

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o comportamento quando a IA retorna confiança abaixo de 0.8 |
| **Pré-condições** | Usuário autenticado com plano ativo; imagem ambígua preparada |
| **Dados de entrada** | Arquivo: imagem com baixa definição ou espécie não reconhecida |
| **Procedimentos** | 1. Enviar `POST /predict` com imagem de baixa qualidade ou ambígua |
| **Resultado esperado** | HTTP 400 ou resposta com indicação de confiança insuficiente; histórico não salvo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-21 — Análise com limite de imagens esgotado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema bloqueia análise quando o usuário atingiu o limite do plano |
| **Pré-condições** | Usuário autenticado; `imageRequests` igual ao `imageLimit` do plano |
| **Dados de entrada** | Arquivo: `milho_doente.jpg` (qualquer imagem válida) |
| **Procedimentos** | 1. Enviar `POST /predict` com limite já esgotado |
| **Resultado esperado** | HTTP 429/403 com mensagem indicando limite de análises atingido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-22 — Análise sem plano associado ao usuário

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema impede análise para usuário sem plano |
| **Pré-condições** | Usuário autenticado sem plano associado |
| **Dados de entrada** | Arquivo: imagem válida |
| **Procedimentos** | 1. Enviar `POST /predict` com usuário que não possui planId |
| **Resultado esperado** | HTTP 403/400 com mensagem indicando que o usuário não possui plano ativo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-23 — Análise com dados de localização

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a análise considera dados climáticos quando localização é fornecida |
| **Pré-condições** | Usuário autenticado com plano ativo e limite disponível |
| **Dados de entrada** | Arquivo: `trigo_doente.jpg` / Localização: `{ "lat": -27.59, "lng": -48.55 }` |
| **Procedimentos** | 1. Enviar `POST /predict` com campo `location` preenchido |
| **Resultado esperado** | HTTP 200; resposta inclui compatibilidade climática da doença; análise mais contextualizada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Histórico

---

### CT-24 — Listar histórico de análises do usuário

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o usuário consegue recuperar seu histórico completo de análises |
| **Pré-condições** | Usuário autenticado; ao menos 1 análise registrada |
| **Dados de entrada** | Token de autenticação |
| **Procedimentos** | 1. Enviar `GET /history` autenticado sem filtros |
| **Resultado esperado** | HTTP 200 com lista de objetos History do usuário, ordenada por data |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-25 — Filtrar histórico por cultura

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o filtro de histórico por tipo de cultura (crop) |
| **Pré-condições** | Usuário autenticado; histórico com análises de culturas distintas |
| **Dados de entrada** | Query param: `crop=Corn` |
| **Procedimentos** | 1. Enviar `GET /history?crop=Corn` |
| **Resultado esperado** | HTTP 200 com lista contendo apenas análises de milho |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-26 — Filtrar histórico por intervalo de datas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o filtro de histórico por data de início e fim |
| **Pré-condições** | Usuário autenticado; histórico com análises em datas variadas |
| **Dados de entrada** | Query params: `startDate=2025-01-01&endDate=2025-03-31` |
| **Procedimentos** | 1. Enviar `GET /history?startDate=2025-01-01&endDate=2025-03-31` |
| **Resultado esperado** | HTTP 200 com análises apenas dentro do intervalo especificado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-27 — Filtrar histórico por cultura e data combinados

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar filtro combinado de cultura e intervalo de datas |
| **Pré-condições** | Usuário autenticado; histórico com análises diversas |
| **Dados de entrada** | Query params: `crop=Soybean&startDate=2025-01-01&endDate=2025-12-31` |
| **Procedimentos** | 1. Enviar `GET /history?crop=Soybean&startDate=2025-01-01&endDate=2025-12-31` |
| **Resultado esperado** | HTTP 200 com análises de soja dentro do período indicado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-28 — Obter análise por ID válido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o usuário consegue consultar os detalhes de uma análise específica |
| **Pré-condições** | Usuário autenticado; análise pertencente ao usuário |
| **Dados de entrada** | ID: `abc-123` (ID de uma análise do usuário) |
| **Procedimentos** | 1. Enviar `GET /history/abc-123` autenticado |
| **Resultado esperado** | HTTP 200 com HistoryDto completo (doença, causas, manejo, precauções, imagem) |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-29 — Acessar análise pertencente a outro usuário

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema impede acesso a análises de outros usuários |
| **Pré-condições** | Usuário A autenticado; análise pertencente ao Usuário B |
| **Dados de entrada** | ID: `xyz-456` (análise de outro usuário) |
| **Procedimentos** | 1. Enviar `GET /history/xyz-456` autenticado como Usuário A |
| **Resultado esperado** | HTTP 403/404 com mensagem de recurso não encontrado ou acesso negado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-30 — Obter análise com ID inexistente

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o comportamento ao buscar análise com ID que não existe |
| **Pré-condições** | Usuário autenticado |
| **Dados de entrada** | ID: `id-inexistente-999` |
| **Procedimentos** | 1. Enviar `GET /history/id-inexistente-999` |
| **Resultado esperado** | HTTP 404 com mensagem de registro não encontrado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Chat

---

### CT-31 — Enviar mensagem no chat com limite disponível

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o fluxo completo de envio de mensagem e obtenção de resposta da IA |
| **Pré-condições** | Usuário autenticado com plano ativo e limite de chat disponível; agente N8n acessível |
| **Dados de entrada** | Conteúdo: `"Quais os cuidados para milho com ferrugem?"` / sessionId: `sess-001` |
| **Procedimentos** | 1. Enviar `POST /chat` com `{ "content": "...", "sessionId": "sess-001" }` <br> 2. Verificar resposta da IA |
| **Resultado esperado** | HTTP 200 com resposta da IA; mensagem humana e resposta IA salvas; limite de chat incrementado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-32 — Enviar mensagem com limite de chat esgotado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema bloqueia mensagens quando o limite de chat é atingido |
| **Pré-condições** | Usuário autenticado; `chatRequests` igual ao `chatLimit` do plano |
| **Dados de entrada** | Conteúdo: `"Mensagem qualquer"` / sessionId: `sess-001` |
| **Procedimentos** | 1. Enviar `POST /chat` com limite já esgotado |
| **Resultado esperado** | HTTP 429/403 com mensagem indicando limite de chat atingido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-33 — Consultar histórico de conversa por sessionId

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o histórico de uma sessão de chat é retornado corretamente |
| **Pré-condições** | Usuário autenticado; sessão com mensagens registradas |
| **Dados de entrada** | sessionId: `sess-001` |
| **Procedimentos** | 1. Enviar `GET /chat/history?sessionId=sess-001` |
| **Resultado esperado** | HTTP 200 com lista de ChatMessage ordenada por data (sender: human/ai) |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-34 — Listar sessões de chat do usuário

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o sistema retorna a lista de sessões de chat do usuário autenticado |
| **Pré-condições** | Usuário autenticado; ao menos 1 sessão registrada |
| **Dados de entrada** | Token de autenticação |
| **Procedimentos** | 1. Enviar `GET /chat/sessions` autenticado |
| **Resultado esperado** | HTTP 200 com lista de sessões (sessionId, data da última mensagem) |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-35 — Enviar mensagem sem sessionId

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o comportamento ao enviar mensagem sem informar sessionId |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Corpo: `{ "content": "Mensagem sem sessão" }` (sem sessionId) |
| **Procedimentos** | 1. Enviar `POST /chat` sem o campo `sessionId` |
| **Resultado esperado** | HTTP 400 com mensagem indicando campo obrigatório, ou nova sessão criada automaticamente (conforme comportamento implementado) |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Planos

---

### CT-36 — Listar todos os planos disponíveis

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o endpoint retorna todos os planos cadastrados com seus limites e preços |
| **Pré-condições** | API backend em execução; ao menos 1 plano cadastrado no banco |
| **Dados de entrada** | Nenhum (rota pública ou autenticada) |
| **Procedimentos** | 1. Enviar `GET /plan` |
| **Resultado esperado** | HTTP 200 com lista de planos contendo `{ type, imageLimit, chatLimit, features, price }` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Serviço de IA (Flask)

---

### CT-37 — Predição de doença em imagem de milho

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o serviço IA classifica corretamente uma imagem de milho com doença |
| **Pré-condições** | Serviço Flask em execução na porta 5000; modelo de milho carregado |
| **Dados de entrada** | Arquivo: `milho_ferrugem.jpg` |
| **Procedimentos** | 1. Enviar `POST /predict` ao serviço Flask com a imagem no campo `image` |
| **Resultado esperado** | HTTP 200 com `{ "plant": "Corn", "plantConfidence": ≥0.8, "prediction": "Northern Leaf Blight", "predictionConfidence": ≥0.8 }` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-38 — Predição de doença em imagem de soja

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o serviço IA classifica corretamente uma imagem de soja com doença |
| **Pré-condições** | Serviço Flask em execução; modelo de soja carregado (10 doenças) |
| **Dados de entrada** | Arquivo: `soja_ferrugem.jpg` |
| **Procedimentos** | 1. Enviar `POST /predict` ao serviço Flask com imagem de soja doente |
| **Resultado esperado** | HTTP 200 com `{ "plant": "Soybean", "plantConfidence": ≥0.8, "prediction": nome da doença, "predictionConfidence": ≥0.8 }` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-39 — Predição de doença em imagem de trigo

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o serviço IA classifica corretamente uma imagem de trigo com doença |
| **Pré-condições** | Serviço Flask em execução; modelo de trigo carregado (7 doenças) |
| **Dados de entrada** | Arquivo: `trigo_septoria.jpg` |
| **Procedimentos** | 1. Enviar `POST /predict` ao serviço Flask com imagem de trigo doente |
| **Resultado esperado** | HTTP 200 com `{ "plant": "Wheat", "plantConfidence": ≥0.8, "prediction": nome da doença, "predictionConfidence": ≥0.8 }` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-40 — Requisição ao serviço IA sem imagem

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o serviço Flask retorna erro quando nenhuma imagem é enviada |
| **Pré-condições** | Serviço Flask em execução |
| **Dados de entrada** | Corpo vazio (sem campo `image`) |
| **Procedimentos** | 1. Enviar `POST /predict` ao Flask sem arquivo |
| **Resultado esperado** | HTTP 400 com mensagem de erro indicando ausência de imagem |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-41 — Enviar imagem corrompida ao serviço IA

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o serviço Flask trata adequadamente arquivos de imagem corrompidos |
| **Pré-condições** | Serviço Flask em execução |
| **Dados de entrada** | Arquivo: `corrompido.jpg` (arquivo JPEG com bytes inválidos) |
| **Procedimentos** | 1. Enviar `POST /predict` com arquivo de imagem corrompido |
| **Resultado esperado** | HTTP 400/500 com mensagem de erro; serviço não crasha |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-42 — Predição em imagem de planta saudável

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o serviço IA retorna resultado "saudável" para planta sem doença |
| **Pré-condições** | Serviço Flask em execução; modelos carregados |
| **Dados de entrada** | Arquivo: `milho_saudavel.jpg` |
| **Procedimentos** | 1. Enviar `POST /predict` com imagem de planta saudável |
| **Resultado esperado** | HTTP 200 com `{ "plant": "Corn", "prediction": "healthy", "predictionConfidence": ≥0.8 }` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-43 — Verificar campos obrigatórios na resposta do serviço IA

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a resposta do Flask sempre contém todos os campos esperados pelo backend |
| **Pré-condições** | Serviço Flask em execução |
| **Dados de entrada** | Arquivo: qualquer imagem válida |
| **Procedimentos** | 1. Enviar `POST /predict` com imagem válida <br> 2. Inspecionar todos os campos da resposta JSON |
| **Resultado esperado** | Resposta contém obrigatoriamente: `plant`, `plantConfidence`, `prediction`, `predictionConfidence` com tipos corretos |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Frontend Web (Next.js)

---

### CT-44 — Exibição da página de login

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a página de login é renderizada corretamente com todos os elementos |
| **Pré-condições** | Servidor Next.js em execução; usuário não autenticado |
| **Dados de entrada** | URL: `/login` |
| **Procedimentos** | 1. Acessar a rota `/login` no navegador sem estar autenticado |
| **Resultado esperado** | Página exibida com campos de e-mail, senha e botão de login visíveis |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-45 — Login com sucesso via interface web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o fluxo de autenticação completo pelo formulário web |
| **Pré-condições** | Usuário cadastrado; servidor Next.js e backend em execução |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Acessar `/login` <br> 2. Preencher e-mail e senha <br> 3. Clicar em "Entrar" |
| **Resultado esperado** | Redirecionamento para a página de analytics (`/analytics`); sessão autenticada no contexto |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-46 — Cadastro de novo usuário via interface web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o formulário de cadastro cria um novo usuário com sucesso |
| **Pré-condições** | Servidor Next.js e backend em execução; e-mail não cadastrado |
| **Dados de entrada** | Nome: `Novo Usuário` / E-mail: `novo@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Acessar `/signup` <br> 2. Preencher os campos do formulário <br> 3. Clicar em "Cadastrar" |
| **Resultado esperado** | Usuário criado; redirecionamento para login ou dashboard; mensagem de sucesso exibida |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-47 — Rota protegida sem autenticação redireciona para login

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que rotas protegidas redirecionam usuário não autenticado para login |
| **Pré-condições** | Usuário não autenticado; servidor em execução |
| **Dados de entrada** | URL: `/analytics` (rota protegida) |
| **Procedimentos** | 1. Acessar `/analytics` sem estar autenticado <br> 2. Observar o redirecionamento |
| **Resultado esperado** | Redirecionamento automático para `/login` |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-48 — Upload de imagem e execução de análise no frontend web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o fluxo de upload de imagem e exibição do resultado na aba "Nova Análise" |
| **Pré-condições** | Usuário autenticado com plano ativo e limite disponível; IA e backend operacionais |
| **Dados de entrada** | Arquivo: `soja_doente.jpg` (imagem válida via input de arquivo) |
| **Procedimentos** | 1. Acessar `/analytics` <br> 2. Selecionar imagem via input <br> 3. Confirmar preview da imagem <br> 4. Clicar em "Analisar" <br> 5. Aguardar resultado |
| **Resultado esperado** | Resultado exibido com: cultura identificada, doença, nível de confiança, causas, manejo e precauções |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-49 — Visualização e filtro do histórico no frontend web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a aba de histórico exibe as análises e que os filtros funcionam |
| **Pré-condições** | Usuário autenticado com análises registradas |
| **Dados de entrada** | Filtro: Cultura = `Corn` / Período: últimos 30 dias |
| **Procedimentos** | 1. Acessar a aba "Histórico" em `/analytics` <br> 2. Aplicar filtro de cultura e data <br> 3. Verificar lista de resultados |
| **Resultado esperado** | Lista exibida com apenas análises de milho dentro do período; cards com informações resumidas |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-50 — Abertura do painel de chat a partir do histórico

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o chat panel abre com o contexto correto da análise selecionada |
| **Pré-condições** | Usuário autenticado; ao menos 1 item no histórico |
| **Dados de entrada** | Item de histórico com doença identificada |
| **Procedimentos** | 1. Acessar aba "Histórico" <br> 2. Clicar no ícone/botão de chat em um item do histórico <br> 3. Enviar uma mensagem |
| **Resultado esperado** | Painel de chat aberto; resposta da IA contextualizada à análise selecionada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-51 — Exibição do limite de uso na interface web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o indicador de limite de uso é atualizado e exibido corretamente |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar `/analytics` <br> 2. Observar componente de limite de análises e chat <br> 3. Realizar uma análise <br> 4. Verificar se o contador atualiza |
| **Resultado esperado** | Contador de uso exibido corretamente; após análise, valor incrementado visualmente |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-52 — Exibição de erro ao tentar análise com limite esgotado no frontend

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a interface exibe mensagem adequada quando o limite é atingido |
| **Pré-condições** | Usuário autenticado com limite de imagens esgotado |
| **Dados de entrada** | Tentativa de análise com limite esgotado |
| **Procedimentos** | 1. Acessar `/analytics` com limite esgotado <br> 2. Fazer upload de imagem <br> 3. Clicar em "Analisar" |
| **Resultado esperado** | Mensagem de erro exibida na interface informando que o limite foi atingido; análise não processada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-53 — Logout e limpeza de sessão no frontend web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o logout limpa a sessão e redireciona para a página pública |
| **Pré-condições** | Usuário autenticado na interface web |
| **Dados de entrada** | Ação de logout no menu/header |
| **Procedimentos** | 1. Clicar na opção de logout <br> 2. Tentar acessar `/analytics` novamente |
| **Resultado esperado** | Sessão encerrada; redirecionamento para `/login`; acesso a rotas protegidas negado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: App Mobile (Expo)

---

### CT-54 — Tela de login no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a tela de login é exibida corretamente e permite autenticação |
| **Pré-condições** | Aplicativo Expo instalado/em execução; usuário cadastrado |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Abrir o aplicativo <br> 2. Navegar para a tela de login <br> 3. Preencher os campos <br> 4. Pressionar o botão de login |
| **Resultado esperado** | Autenticação realizada; navegação para a tela de Analytics |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-55 — Tela de cadastro no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a tela de cadastro cria um novo usuário via app mobile |
| **Pré-condições** | Aplicativo em execução; e-mail não cadastrado |
| **Dados de entrada** | Nome: `Novo Usuário` / E-mail: `novo@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Abrir app e ir para tela de cadastro <br> 2. Preencher nome, e-mail e senha <br> 3. Pressionar "Cadastrar" |
| **Resultado esperado** | Usuário criado; redirecionamento para login ou tela principal |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-56 — Capturar foto pela câmera para análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o usuário consegue usar a câmera do dispositivo para capturar uma imagem |
| **Pré-condições** | Usuário autenticado no app; permissão de câmera concedida |
| **Dados de entrada** | Imagem capturada em tempo real pela câmera |
| **Procedimentos** | 1. Acessar aba "Nova Análise" no app <br> 2. Selecionar opção de câmera <br> 3. Capturar foto de uma planta |
| **Resultado esperado** | Preview da imagem exibido na tela; botão "Analisar" habilitado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-57 — Selecionar foto da galeria para análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o usuário consegue selecionar uma imagem da galeria do dispositivo |
| **Pré-condições** | Usuário autenticado; permissão de galeria concedida; imagem disponível |
| **Dados de entrada** | Imagem: `milho_doente.jpg` da galeria |
| **Procedimentos** | 1. Acessar aba "Nova Análise" <br> 2. Selecionar opção de galeria <br> 3. Escolher imagem |
| **Resultado esperado** | Preview da imagem selecionada exibido; botão "Analisar" habilitado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-58 — Executar análise de imagem no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar o fluxo completo de análise no app, da imagem ao resultado exibido |
| **Pré-condições** | Usuário autenticado com plano ativo; imagem selecionada; IA e backend operacionais |
| **Dados de entrada** | Imagem de planta doente selecionada (câmera ou galeria) |
| **Procedimentos** | 1. Selecionar imagem <br> 2. Pressionar "Analisar" <br> 3. Aguardar processamento <br> 4. Verificar resultado |
| **Resultado esperado** | Resultado exibido com: cultura, doença, confiança, causas, manejo e precauções; indicador de carregamento visível durante processamento |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-59 — Visualizar aba de histórico no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a aba de histórico lista as análises do usuário no app |
| **Pré-condições** | Usuário autenticado com análises registradas |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar aba "Histórico" no app <br> 2. Verificar lista de análises exibidas |
| **Resultado esperado** | Lista com cards de análises anteriores; dados de cultura, doença e data visíveis |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-60 — Filtrar histórico por cultura no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar os filtros de histórico por cultura na interface mobile |
| **Pré-condições** | Usuário autenticado; histórico com análises de culturas distintas |
| **Dados de entrada** | Filtro selecionado: `Soybean` |
| **Procedimentos** | 1. Acessar aba "Histórico" <br> 2. Aplicar filtro de cultura "Soja/Soybean" <br> 3. Verificar lista atualizada |
| **Resultado esperado** | Apenas análises de soja exibidas após aplicar o filtro |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-61 — Abrir chat modal a partir do histórico mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o chat modal abre corretamente ao pressionar botão de chat no histórico |
| **Pré-condições** | Usuário autenticado com limite de chat disponível; ao menos 1 item no histórico |
| **Dados de entrada** | Item do histórico com doença identificada |
| **Procedimentos** | 1. Acessar aba "Histórico" <br> 2. Pressionar botão de chat em um item <br> 3. Digitar e enviar uma mensagem |
| **Resultado esperado** | Modal de chat aberto; resposta da IA recebida e exibida; mensagens listadas corretamente |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-62 — Visualizar aba de estatísticas no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que a aba de estatísticas exibe dados agregados de análises do usuário |
| **Pré-condições** | Usuário autenticado com ao menos 3 análises registradas |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar aba "Estatísticas" no app <br> 2. Verificar distribuição de doenças e culturas exibidas |
| **Resultado esperado** | Gráficos/contadores exibindo distribuição de culturas analisadas e doenças mais frequentes |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-63 — Logout no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o logout encerra a sessão e redireciona para login no app |
| **Pré-condições** | Usuário autenticado no app |
| **Dados de entrada** | Ação de logout |
| **Procedimentos** | 1. Acessar menu de perfil ou configurações <br> 2. Pressionar "Sair" <br> 3. Tentar acessar aba de Analytics |
| **Resultado esperado** | Sessão encerrada; redirecionamento para tela de login; acesso a áreas autenticadas bloqueado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-64 — Exibição do limite de uso no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Validar que o indicador de limite de análises e chat é exibido e atualizado no app |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar aba "Nova Análise" <br> 2. Observar indicador de limite <br> 3. Realizar uma análise <br> 4. Verificar se o indicador atualiza |
| **Resultado esperado** | Contador de análises restantes visível; decrementa após cada análise realizada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Resumo Geral

| Total de Casos | Aprovados | Reprovados | Pendentes |
|---------------|-----------|------------|-----------|
| 64 | 0 | 0 | 64 |

| Módulo | Qtd. Casos |
|--------|-----------|
| Autenticação | 10 |
| Usuário | 5 |
| Análise de Imagem / Predição | 8 |
| Histórico | 7 |
| Chat | 5 |
| Planos | 1 |
| Serviço de IA (Flask) | 7 |
| Frontend Web (Next.js) | 10 |
| App Mobile (Expo) | 11 |
| **Total** | **64** |
