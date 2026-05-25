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
| **Objetivo** | Verificar se o usuário consegue acessar o sistema com e-mail e senha corretos |
| **Pré-condições** | Usuário previamente cadastrado no sistema |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Acessar a tela de login <br> 2. Preencher o campo de e-mail <br> 3. Preencher o campo de senha <br> 4. Clicar no botão "Entrar" |
| **Resultado esperado** | O usuário é redirecionado para a tela principal do sistema com sua sessão ativa |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-02 — Login com senha incorreta

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema exibe mensagem de erro ao tentar acessar com senha incorreta |
| **Pré-condições** | Usuário previamente cadastrado no sistema |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senhaErrada` |
| **Procedimentos** | 1. Acessar a tela de login <br> 2. Preencher o e-mail corretamente <br> 3. Preencher a senha de forma incorreta <br> 4. Clicar em "Entrar" |
| **Resultado esperado** | O acesso é negado e uma mensagem de erro é exibida na tela informando que as credenciais são inválidas |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-03 — Bloqueio de conta após tentativas inválidas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a conta é bloqueada após múltiplas tentativas de login com senha errada |
| **Pré-condições** | Usuário cadastrado; 4 tentativas incorretas já realizadas anteriormente |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senhaErrada` (5ª tentativa) |
| **Procedimentos** | 1. Acessar a tela de login <br> 2. Realizar mais uma tentativa de login com senha incorreta <br> 3. Tentar novamente com a senha correta |
| **Resultado esperado** | O sistema exibe mensagem informando que a conta foi bloqueada; o login com a senha correta também é recusado enquanto o bloqueio estiver ativo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-04 — Solicitar recuperação de senha

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue solicitar a recuperação de senha e receber o código por e-mail |
| **Pré-condições** | Usuário cadastrado com e-mail válido |
| **Dados de entrada** | E-mail: `usuario@email.com` |
| **Procedimentos** | 1. Acessar a tela de login <br> 2. Clicar em "Esqueci minha senha" <br> 3. Informar o e-mail cadastrado <br> 4. Confirmar a solicitação |
| **Resultado esperado** | O sistema confirma o envio e o usuário recebe um e-mail com um código numérico de recuperação |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-05 — Inserir código de recuperação válido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue avançar para a tela de nova senha ao inserir o código correto |
| **Pré-condições** | Código de recuperação recebido por e-mail e ainda dentro do prazo de validade |
| **Dados de entrada** | Código: `123456` (recebido por e-mail) |
| **Procedimentos** | 1. Acessar a tela de inserção do código de recuperação <br> 2. Digitar o código recebido por e-mail <br> 3. Confirmar |
| **Resultado esperado** | O sistema aceita o código e exibe a tela de criação de nova senha |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-06 — Inserir código de recuperação inválido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema recusa um código de recuperação incorreto e exibe mensagem de erro |
| **Pré-condições** | Código de recuperação enviado para o e-mail do usuário |
| **Dados de entrada** | Código: `000000` (código incorreto) |
| **Procedimentos** | 1. Acessar a tela de inserção do código de recuperação <br> 2. Digitar um código incorreto <br> 3. Confirmar |
| **Resultado esperado** | O sistema recusa o código e exibe mensagem de erro informando que o código é inválido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-07 — Inserir código de recuperação expirado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema recusa um código de recuperação após o prazo de validade ter expirado |
| **Pré-condições** | Código de recuperação gerado há mais de 5 minutos |
| **Dados de entrada** | Código expirado recebido por e-mail |
| **Procedimentos** | 1. Aguardar mais de 5 minutos após receber o código <br> 2. Acessar a tela de inserção do código <br> 3. Digitar o código expirado <br> 4. Confirmar |
| **Resultado esperado** | O sistema recusa o código e exibe mensagem informando que o prazo de validade expirou |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-08 — Alterar senha após recuperação

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue definir uma nova senha e acessar o sistema com ela |
| **Pré-condições** | Código de recuperação inserido e validado com sucesso |
| **Dados de entrada** | Nova senha: `novaSenha@456` |
| **Procedimentos** | 1. Na tela de nova senha, digitar a nova senha <br> 2. Confirmar a nova senha <br> 3. Salvar a alteração <br> 4. Realizar login com a nova senha |
| **Resultado esperado** | A senha é alterada com sucesso e o login com a nova senha é efetuado normalmente |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-09 — Exibição da tela de login para usuário não autenticado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a tela de login é exibida corretamente ao acessar o sistema sem estar autenticado |
| **Pré-condições** | Sistema em execução; usuário não autenticado |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Abrir o navegador e acessar a URL da aplicação sem estar autenticado <br> 2. Observar o carregamento da tela |
| **Resultado esperado** | A tela de login é exibida com campos de e-mail, senha e botão de acesso visíveis e funcionais |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-10 — Manutenção da sessão autenticada

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário autenticado permanece com acesso ativo e suas informações são exibidas corretamente |
| **Pré-condições** | Usuário autenticado no sistema |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Realizar login com credenciais válidas <br> 2. Navegar por diferentes áreas do sistema <br> 3. Verificar se as informações do usuário são exibidas |
| **Resultado esperado** | O usuário permanece autenticado e o sistema exibe seu nome e e-mail corretamente nas áreas pertinentes |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Usuário

---

### CT-11 — Cadastro de novo usuário com dados válidos

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se um novo usuário consegue se cadastrar no sistema com dados válidos e acessá-lo em seguida |
| **Pré-condições** | E-mail não utilizado em cadastro anterior |
| **Dados de entrada** | Nome: `João Silva` / E-mail: `joao@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Acessar a tela de cadastro <br> 2. Preencher nome, e-mail e senha <br> 3. Confirmar o cadastro <br> 4. Realizar login com os dados cadastrados |
| **Resultado esperado** | O cadastro é concluído com sucesso e o usuário consegue acessar o sistema |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-12 — Cadastro com e-mail já existente

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede o cadastro com um e-mail já utilizado por outra conta |
| **Pré-condições** | Usuário com e-mail `joao@email.com` já cadastrado |
| **Dados de entrada** | Nome: `Outro Nome` / E-mail: `joao@email.com` / Senha: `outraSenha@123` |
| **Procedimentos** | 1. Acessar a tela de cadastro <br> 2. Preencher os campos usando o e-mail já cadastrado <br> 3. Confirmar o cadastro |
| **Resultado esperado** | O cadastro é recusado e o sistema exibe mensagem informando que o e-mail já está em uso |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-13 — Cadastro sem preencher campos obrigatórios

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede o cadastro quando campos obrigatórios são deixados em branco |
| **Pré-condições** | Sistema em execução |
| **Dados de entrada** | Apenas e-mail preenchido: `joao@email.com` (nome e senha em branco) |
| **Procedimentos** | 1. Acessar a tela de cadastro <br> 2. Preencher somente o campo de e-mail <br> 3. Deixar nome e senha em branco <br> 4. Tentar confirmar o cadastro |
| **Resultado esperado** | O sistema bloqueia o envio e destaca os campos obrigatórios não preenchidos com mensagens de validação |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-14 — Cadastro com e-mail em formato inválido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema rejeita um e-mail com formato inválido durante o cadastro |
| **Pré-condições** | Sistema em execução |
| **Dados de entrada** | Nome: `João` / E-mail: `emailinvalido` (sem @) / Senha: `senha@123` |
| **Procedimentos** | 1. Acessar a tela de cadastro <br> 2. Preencher o campo de e-mail com um valor em formato inválido <br> 3. Preencher os demais campos corretamente <br> 4. Tentar confirmar o cadastro |
| **Resultado esperado** | O sistema exibe mensagem de validação indicando que o e-mail informado não está em formato válido e impede o cadastro |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-15 — Visualização dos limites de uso do plano

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue visualizar a quantidade de análises e mensagens de chat disponíveis no seu plano |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Realizar login no sistema <br> 2. Acessar a área de uso ou plano <br> 3. Observar as informações de limites exibidas |
| **Resultado esperado** | O sistema exibe a quantidade de análises de imagem e mensagens de chat utilizadas e o limite total disponível no plano do usuário |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Análise de Imagem / Predição

---

### CT-16 — Analisar imagem de planta doente (fluxo completo)

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue analisar uma imagem de planta doente e receber o diagnóstico completo |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem de milho com ferrugem |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar uma imagem de milho com sintomas visíveis de doença <br> 3. Clicar em "Analisar Imagem" <br> 4. Aguardar o processamento |
| **Resultado esperado** | O sistema exibe: cultura identificada (Milho) com percentual de confiança, nome da doença identificada, explicação, causas e recomendações de manejo; botão "Tirar dúvidas sobre esta análise" disponível |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-17 — Analisar imagem de planta saudável

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema identifica e exibe corretamente o resultado para uma planta sem doença |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem de soja saudável |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar uma imagem de soja sem sintomas visíveis <br> 3. Clicar em "Analisar Imagem" <br> 4. Aguardar o processamento |
| **Resultado esperado** | O sistema exibe a cultura identificada e indica que a planta está saudável; a análise é salva no histórico do usuário |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-18 — Tentar analisar sem selecionar imagem

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede o início da análise quando nenhuma imagem foi selecionada |
| **Pré-condições** | Usuário autenticado na aba "Nova Análise" |
| **Dados de entrada** | Nenhum (sem imagem selecionada) |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Não selecionar nenhuma imagem <br> 3. Observar o estado do botão "Analisar Imagem" |
| **Resultado esperado** | O botão "Analisar Imagem" permanece desabilitado enquanto nenhuma imagem estiver selecionada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-19 — Selecionar arquivo que não é imagem para análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema rejeita o envio de arquivos que não sejam imagens |
| **Pré-condições** | Usuário autenticado na aba "Nova Análise" |
| **Dados de entrada** | Arquivo PDF ou documento de texto |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Tentar selecionar um arquivo PDF ou documento no seletor de arquivo <br> 3. Tentar prosseguir com a análise |
| **Resultado esperado** | O sistema não aceita o arquivo e exibe mensagem informando que apenas imagens são suportadas |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-20 — Analisar imagem com qualidade insuficiente para diagnóstico

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar o comportamento do sistema quando a imagem enviada não permite um diagnóstico com confiança suficiente |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem de baixa resolução, muito escura ou com planta fora de foco |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar uma imagem de baixa qualidade <br> 3. Clicar em "Analisar Imagem" <br> 4. Aguardar o processamento |
| **Resultado esperado** | O sistema exibe mensagem informando que não foi possível realizar o diagnóstico com confiança suficiente e orienta o usuário a tentar novamente com uma imagem de melhor qualidade |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-21 — Tentar analisar com limite de análises esgotado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema bloqueia novas análises quando o usuário atingiu o limite do seu plano |
| **Pré-condições** | Usuário autenticado com todas as análises do plano já utilizadas |
| **Dados de entrada** | Qualquer imagem válida |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Observar o contador de análises <br> 3. Selecionar uma imagem <br> 4. Tentar clicar em "Analisar Imagem" |
| **Resultado esperado** | O contador exibe o limite atingido em destaque; o botão "Analisar Imagem" está desabilitado e a interface indica que o limite do plano foi atingido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-22 — Tentar analisar sem plano ativo

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede análises para usuários sem plano associado |
| **Pré-condições** | Usuário autenticado sem plano ativo |
| **Dados de entrada** | Qualquer imagem válida |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar uma imagem <br> 3. Tentar iniciar a análise |
| **Resultado esperado** | O sistema exibe mensagem informando que é necessário um plano ativo para realizar análises |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-23 — Analisar imagem com localização geográfica informada

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o resultado da análise incorpora informações contextuais quando a localização do usuário está disponível |
| **Pré-condições** | Usuário autenticado com plano ativo; permissão de localização concedida ao aplicativo |
| **Dados de entrada** | Imagem de trigo doente; localização GPS do dispositivo habilitada |
| **Procedimentos** | 1. Permitir acesso à localização quando solicitado <br> 2. Acessar a aba "Nova Análise" <br> 3. Selecionar imagem de trigo com sintomas <br> 4. Clicar em "Analisar Imagem" |
| **Resultado esperado** | O resultado exibido inclui informações contextualizadas à região do usuário, tornando as recomendações de manejo mais precisas |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Histórico

---

### CT-24 — Visualizar histórico completo de análises

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue visualizar todas as suas análises anteriores na aba de histórico |
| **Pré-condições** | Usuário autenticado com ao menos uma análise registrada |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Observar a lista de análises exibidas |
| **Resultado esperado** | A lista exibe todas as análises do usuário com nome da doença ou cultura, data e indicadores de confiança, ordenadas da mais recente para a mais antiga |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-25 — Filtrar histórico por cultura

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o filtro por cultura restringe corretamente os itens exibidos no histórico |
| **Pré-condições** | Usuário autenticado com análises de ao menos duas culturas diferentes registradas |
| **Dados de entrada** | Filtro de cultura: Milho |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Selecionar "Milho" no filtro de cultura <br> 3. Observar a lista atualizada |
| **Resultado esperado** | A lista exibe apenas análises de milho; análises de outras culturas não são exibidas |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-26 — Filtrar histórico por período de datas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o filtro por data restringe os itens do histórico ao intervalo selecionado |
| **Pré-condições** | Usuário autenticado com análises registradas em datas variadas |
| **Dados de entrada** | Período: 01/01/2025 a 31/03/2025 |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Selecionar um intervalo de datas no filtro de período <br> 3. Observar a lista atualizada |
| **Resultado esperado** | A lista exibe apenas análises realizadas dentro do intervalo selecionado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-27 — Filtrar histórico combinando cultura e período

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se os filtros de cultura e período funcionam corretamente quando aplicados juntos |
| **Pré-condições** | Usuário autenticado com análises variadas de culturas e datas distintas |
| **Dados de entrada** | Cultura: Soja / Período: últimos 30 dias |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Selecionar "Soja" no filtro de cultura <br> 3. Selecionar o período desejado <br> 4. Observar a lista atualizada |
| **Resultado esperado** | A lista exibe apenas análises de soja realizadas no período selecionado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-28 — Visualizar detalhes de uma análise do histórico

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue abrir e visualizar todos os detalhes de uma análise anterior |
| **Pré-condições** | Usuário autenticado com ao menos uma análise registrada no histórico |
| **Dados de entrada** | Item do histórico com diagnóstico de doença |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Clicar em "Ver Detalhes" em uma análise <br> 3. Observar o painel de detalhes |
| **Resultado esperado** | O painel de detalhes exibe a imagem da planta, nome da doença, percentual de confiança, causas, recomendações de manejo e status do diagnóstico |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-29 — Isolamento de histórico entre usuários diferentes

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se um usuário consegue visualizar apenas suas próprias análises, sem acesso às de outros usuários |
| **Pré-condições** | Dois usuários distintos com análises registradas (Usuário A e Usuário B) |
| **Dados de entrada** | Login do Usuário A |
| **Procedimentos** | 1. Realizar login como Usuário A <br> 2. Acessar a aba "Histórico" <br> 3. Verificar se apenas as análises do Usuário A são listadas |
| **Resultado esperado** | O histórico exibe somente as análises do Usuário A; nenhuma análise do Usuário B é visível |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-30 — Confirmar ou contestar diagnóstico no histórico

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue marcar um diagnóstico como confirmado ou incorreto a partir do histórico |
| **Pré-condições** | Usuário autenticado com ao menos uma análise com status "Não confirmado" no histórico |
| **Dados de entrada** | Análise com status pendente de confirmação |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Abrir os detalhes de uma análise com status "Não confirmado" <br> 3. Clicar em "Confirmar Diagnóstico" ou marcar como incorreto <br> 4. Observar a atualização do status |
| **Resultado esperado** | O status da análise é atualizado para "Confirmado" (badge verde) ou "Incorreto" (badge vermelho) e refletido imediatamente na lista do histórico |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Chat

---

### CT-31 — Enviar mensagem no chat de uma análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue enviar uma pergunta sobre uma análise e receber uma resposta contextualizada da IA |
| **Pré-condições** | Usuário autenticado com plano ativo e mensagens de chat disponíveis; análise realizada |
| **Dados de entrada** | Pergunta: "Quais os cuidados para milho com ferrugem?" |
| **Procedimentos** | 1. Após visualizar o resultado de uma análise, clicar em "Tirar dúvidas sobre esta análise" <br> 2. Digitar a pergunta no campo de texto <br> 3. Pressionar Enter ou clicar no botão de envio <br> 4. Aguardar a resposta |
| **Resultado esperado** | A mensagem é enviada e a IA responde com informações contextualizadas à doença identificada na análise; o indicador de digitação é exibido enquanto a resposta é gerada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-32 — Tentar enviar mensagem no chat com limite esgotado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema bloqueia o envio de mensagens quando o limite de chat do plano é atingido |
| **Pré-condições** | Usuário autenticado com todas as mensagens de chat do plano já utilizadas |
| **Dados de entrada** | Qualquer pergunta no campo de chat |
| **Procedimentos** | 1. Abrir o painel de chat a partir de uma análise <br> 2. Digitar uma mensagem <br> 3. Tentar enviar |
| **Resultado esperado** | O sistema exibe mensagem informando que o limite de mensagens do plano foi atingido; o envio é bloqueado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-33 — Rever histórico de conversa de uma sessão anterior

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se as mensagens trocadas em uma sessão de chat anterior são preservadas e exibidas ao reabrir o chat da mesma análise |
| **Pré-condições** | Usuário autenticado com ao menos uma sessão de chat com mensagens registradas |
| **Dados de entrada** | Análise com histórico de conversa |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Clicar no botão de chat de uma análise que já teve conversa anterior <br> 3. Observar as mensagens exibidas |
| **Resultado esperado** | As mensagens anteriores da conversa são carregadas e exibidas na ordem cronológica, permitindo continuidade da conversa |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-34 — Abrir chat a partir do histórico com contexto correto

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se ao abrir o chat a partir de uma análise do histórico, a IA apresenta o contexto correto daquela análise |
| **Pré-condições** | Usuário autenticado com ao menos uma análise no histórico |
| **Dados de entrada** | Análise de soja com ferrugem asiática no histórico |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Clicar no botão "Chat" de uma análise específica <br> 3. Observar a mensagem inicial da IA |
| **Resultado esperado** | O painel de chat abre com a saudação da IA mencionando a cultura e a doença identificadas naquela análise específica |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-35 — Indicador de conexão em tempo real no chat

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o painel de chat exibe o status de conexão em tempo real e o indicador de digitação enquanto a IA processa a resposta |
| **Pré-condições** | Usuário autenticado com acesso ao chat |
| **Dados de entrada** | Qualquer pergunta enviada no chat |
| **Procedimentos** | 1. Abrir o painel de chat de uma análise <br> 2. Observar o indicador de status de conexão no cabeçalho <br> 3. Enviar uma mensagem e observar o comportamento enquanto a IA responde |
| **Resultado esperado** | O cabeçalho exibe "● Conectado" em verde; ao enviar mensagem, aparece o indicador de digitação (três pontos pulsantes) até a resposta chegar |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Planos

---

### CT-36 — Visualizar informações do plano e limites de uso

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue visualizar as informações do seu plano atual e os limites de uso disponíveis |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Realizar login no sistema <br> 2. Acessar a aba "Nova Análise" <br> 3. Observar o contador de uso exibido na tela |
| **Resultado esperado** | O sistema exibe o número de análises de imagem e mensagens de chat já utilizadas em relação ao limite total do plano |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Diagnóstico por IA

---

### CT-37 — Diagnóstico correto de doença em imagem de milho

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema identifica corretamente a cultura e a doença em uma imagem de milho |
| **Pré-condições** | Usuário autenticado com plano ativo; imagem nítida de milho com sintomas visíveis |
| **Dados de entrada** | Imagem de folha de milho com ferrugem comum visível |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar imagem de milho com sintomas de ferrugem <br> 3. Clicar em "Analisar Imagem" <br> 4. Verificar o resultado exibido |
| **Resultado esperado** | O sistema identifica a cultura como Milho e a doença correspondente (ex: Ferrugem Comum, Ferrugem Polissora ou Cercosporiose) com alto nível de confiança |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-38 — Diagnóstico correto de doença em imagem de soja

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema identifica corretamente a cultura e a doença em uma imagem de soja |
| **Pré-condições** | Usuário autenticado com plano ativo; imagem nítida de soja com sintomas visíveis |
| **Dados de entrada** | Imagem de folha de soja com sintomas de ferrugem asiática |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar imagem de soja com sintomas de doença <br> 3. Clicar em "Analisar Imagem" <br> 4. Verificar o resultado exibido |
| **Resultado esperado** | O sistema identifica a cultura como Soja e a doença correspondente (ex: Ferrugem Asiática, Mancha Marrom, Cercosporiose) com alto nível de confiança |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-39 — Diagnóstico correto de doença em imagem de trigo

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema identifica corretamente a cultura e a doença em uma imagem de trigo |
| **Pré-condições** | Usuário autenticado com plano ativo; imagem nítida de trigo com sintomas visíveis |
| **Dados de entrada** | Imagem de folha de trigo com sintomas de septória |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar imagem de trigo com sintomas de doença <br> 3. Clicar em "Analisar Imagem" <br> 4. Verificar o resultado exibido |
| **Resultado esperado** | O sistema identifica a cultura como Trigo e a doença correspondente (ex: Septória, Ferrugem Marrom, Ferrugem Amarela) com alto nível de confiança |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-40 — Comportamento ao enviar imagem que não é de planta

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar o comportamento do sistema quando a imagem enviada não contém uma das culturas suportadas |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Foto de um objeto qualquer (ex: paisagem, animal, objeto) |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar uma imagem que não contenha planta <br> 3. Clicar em "Analisar Imagem" <br> 4. Aguardar o processamento |
| **Resultado esperado** | O sistema exibe mensagem informando que não foi possível identificar uma cultura suportada na imagem e orienta o usuário a tentar com uma foto adequada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-41 — Comportamento ao enviar imagem corrompida

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema trata adequadamente o envio de um arquivo de imagem corrompido sem travar ou apresentar erro inesperado |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Arquivo de imagem com dados inválidos (corrompido) |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar um arquivo de imagem corrompido <br> 3. Clicar em "Analisar Imagem" <br> 4. Aguardar resposta do sistema |
| **Resultado esperado** | O sistema exibe uma mensagem de erro amigável informando que o arquivo não pôde ser processado; o restante da interface permanece funcional |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-42 — Diagnóstico de planta saudável exibe resultado adequado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o resultado exibido ao usuário é claro e adequado quando a planta analisada está saudável |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem nítida de folha de milho saudável, sem manchas ou lesões |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar imagem de planta saudável <br> 3. Clicar em "Analisar Imagem" <br> 4. Observar o resultado |
| **Resultado esperado** | O sistema exibe a cultura identificada e indica que a planta está saudável; a tela não apresenta seções de doença ou manejo de tratamento |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-43 — Resultado da análise sempre exibe todas as informações esperadas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o resultado de qualquer análise bem-sucedida sempre apresenta todas as seções de informação ao usuário |
| **Pré-condições** | Usuário autenticado com plano ativo; imagem válida de planta suportada |
| **Dados de entrada** | Imagem válida de qualquer cultura suportada (Milho, Soja ou Trigo) |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Selecionar imagem válida <br> 3. Clicar em "Analisar Imagem" <br> 4. Verificar todas as seções do resultado |
| **Resultado esperado** | O resultado exibe obrigatoriamente: cultura identificada, percentual de confiança da cultura, diagnóstico da doença (ou indicação de saúde), percentual de confiança do diagnóstico, causas e recomendações de manejo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Frontend Web (Next.js)

---

### CT-44 — Exibição da página inicial para visitantes

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a página inicial é exibida corretamente para um visitante não autenticado, apresentando as funcionalidades da plataforma |
| **Pré-condições** | Usuário não autenticado |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Abrir o navegador e acessar a URL da aplicação web <br> 2. Observar o conteúdo da página |
| **Resultado esperado** | A página exibe o nome da plataforma, descrição do serviço, seção "Como funciona" com os três passos, e botões para criar conta ou fazer login |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-45 — Login com sucesso e redirecionamento para o dashboard

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o login na interface web redireciona o usuário para o dashboard principal após autenticação |
| **Pré-condições** | Usuário cadastrado |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Acessar a página de login <br> 2. Preencher e-mail e senha <br> 3. Clicar em "Entrar" |
| **Resultado esperado** | O usuário é redirecionado para a página de analytics com as abas "Nova Análise", "Histórico" e "Estatísticas" visíveis |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-46 — Cadastro via interface web com validação de senha

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o formulário de cadastro valida a confirmação de senha e cria a conta com sucesso |
| **Pré-condições** | E-mail não cadastrado no sistema |
| **Dados de entrada** | Nome: `Novo Usuário` / E-mail: `novo@email.com` / Senha: `senha@123` / Confirmar senha: `senha@123` |
| **Procedimentos** | 1. Acessar a página de cadastro pelo botão na página inicial ou link da tela de login <br> 2. Preencher nome, e-mail, senha e confirmação de senha <br> 3. Clicar em "Criar Conta" |
| **Resultado esperado** | A conta é criada com sucesso e o usuário é redirecionado para login ou para o dashboard |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-47 — Acesso direto a página protegida sem autenticação

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se tentar acessar o dashboard sem estar autenticado redireciona para a tela de login |
| **Pré-condições** | Usuário não autenticado |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Sem estar logado, tentar acessar diretamente a página de analytics na barra de endereço do navegador <br> 2. Observar o redirecionamento |
| **Resultado esperado** | O sistema redireciona automaticamente para a página de login sem exibir o conteúdo da página protegida |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-48 — Fluxo completo de análise de imagem no frontend web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar o fluxo completo de seleção de imagem, análise e exibição de resultado na interface web |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem de soja com sintomas de doença selecionada pelo seletor de arquivo |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Clicar no botão de seleção de arquivo e escolher uma imagem <br> 3. Confirmar o preview da imagem exibido <br> 4. Clicar em "Analisar Imagem" <br> 5. Aguardar o carregamento do resultado |
| **Resultado esperado** | O spinner de carregamento é exibido durante o processamento; em seguida, o painel direito exibe a cultura, diagnóstico, causas, recomendações e o botão para abrir o chat |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-49 — Filtros e visualização do histórico na interface web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se os filtros e modos de visualização do histórico funcionam corretamente na interface web |
| **Pré-condições** | Usuário autenticado com análises de culturas distintas registradas |
| **Dados de entrada** | Filtro: Cultura = Milho / Período: últimos 30 dias |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Selecionar "Milho" no filtro de cultura <br> 3. Selecionar o período desejado <br> 4. Alternar entre visualização em lista e grade <br> 5. Verificar os resultados |
| **Resultado esperado** | A lista exibe apenas análises de milho no período selecionado; ao alternar para grade, os mesmos itens são apresentados em formato de cards |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-50 — Abrir painel de chat a partir do histórico web

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o painel de chat abre corretamente com o contexto da análise ao clicar no botão de chat no histórico |
| **Pré-condições** | Usuário autenticado com ao menos um item no histórico |
| **Dados de entrada** | Item do histórico com diagnóstico de doença |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Localizar um item de análise <br> 3. Clicar no botão "Chat" do item <br> 4. Enviar uma pergunta sobre a doença identificada |
| **Resultado esperado** | O painel de chat desliza da direita e exibe no cabeçalho a cultura e data da análise; a IA responde de forma contextualizada à doença daquela análise |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-51 — Contador de uso é atualizado após realizar análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o contador de análises utilizadas é incrementado visualmente logo após a conclusão de uma análise |
| **Pré-condições** | Usuário autenticado com plano ativo e ao menos uma análise disponível |
| **Dados de entrada** | Imagem válida para análise |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" e observar o valor atual do contador de análises <br> 2. Realizar uma análise completa <br> 3. Observar o contador após o resultado ser exibido |
| **Resultado esperado** | O contador incrementa em 1 após a análise (ex: de "3/10" para "4/10"), refletindo o uso atualizado do plano |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-52 — Interface bloqueia análise quando limite é atingido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a interface web desabilita o botão de análise e exibe aviso quando o limite do plano é atingido |
| **Pré-condições** | Usuário autenticado com limite de análises totalmente esgotado |
| **Dados de entrada** | Qualquer imagem selecionada |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" com o limite de análises já atingido <br> 2. Selecionar uma imagem <br> 3. Verificar o estado do botão "Analisar Imagem" |
| **Resultado esperado** | O botão "Analisar Imagem" aparece desabilitado; o contador exibe o limite atingido em destaque (vermelho); nenhuma análise é iniciada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-53 — Logout encerra sessão e restringe acesso

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o logout encerra a sessão corretamente e impede o acesso ao dashboard sem nova autenticação |
| **Pré-condições** | Usuário autenticado na interface web |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Clicar no botão de logout no cabeçalho da aplicação <br> 2. Verificar o redirecionamento <br> 3. Tentar acessar diretamente a página de analytics pela barra de endereço |
| **Resultado esperado** | O usuário é redirecionado para a página de login após o logout; a tentativa de acesso direto ao dashboard também redireciona para o login |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: App Mobile (Expo)

---

### CT-54 — Login e navegação para o dashboard no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue fazer login pelo aplicativo mobile e ser direcionado para a tela principal |
| **Pré-condições** | Aplicativo instalado e em execução; usuário cadastrado |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senha@123` |
| **Procedimentos** | 1. Abrir o aplicativo <br> 2. Tocar em "Entrar" na tela inicial <br> 3. Preencher e-mail e senha <br> 4. Tocar no botão "Entrar" |
| **Resultado esperado** | O usuário é autenticado e direcionado para a tela de análise com as abas "Nova Análise", "Histórico" e "Estatísticas" visíveis |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-55 — Cadastro de nova conta no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se um novo usuário consegue criar uma conta pelo aplicativo mobile |
| **Pré-condições** | Aplicativo em execução; e-mail não cadastrado no sistema |
| **Dados de entrada** | Nome: `Novo Usuário` / E-mail: `novo@email.com` / Senha: `senha@123` / Confirmar senha: `senha@123` |
| **Procedimentos** | 1. Abrir o aplicativo <br> 2. Tocar em "Criar Conta Grátis" na tela inicial <br> 3. Preencher nome, e-mail, senha e confirmação de senha <br> 4. Tocar em "Criar Conta" |
| **Resultado esperado** | A conta é criada com sucesso e o usuário é direcionado para a tela de login ou para o dashboard |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-56 — Capturar foto pela câmera do dispositivo para análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue usar a câmera do dispositivo para tirar uma foto e usá-la na análise |
| **Pré-condições** | Usuário autenticado no app; permissão de câmera concedida ao aplicativo |
| **Dados de entrada** | Foto capturada em tempo real pela câmera |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Tocar no botão "Câmera" <br> 3. Tirar uma foto da planta <br> 4. Confirmar a foto |
| **Resultado esperado** | A imagem capturada é exibida como preview na tela de análise e o botão "Analisar Imagem" é habilitado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-57 — Selecionar foto da galeria do dispositivo para análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue selecionar uma imagem existente na galeria do dispositivo para análise |
| **Pré-condições** | Usuário autenticado no app; permissão de galeria concedida; imagem de planta disponível no dispositivo |
| **Dados de entrada** | Imagem de milho doente salva na galeria do dispositivo |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" <br> 2. Tocar no botão "Galeria" <br> 3. Navegar e selecionar uma imagem de planta <br> 4. Confirmar a seleção |
| **Resultado esperado** | A imagem selecionada é exibida como preview na tela e o botão "Analisar Imagem" é habilitado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-58 — Fluxo completo de análise de imagem no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar o fluxo completo desde a seleção da imagem até a exibição do resultado no aplicativo mobile |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis; imagem de planta doente selecionada |
| **Dados de entrada** | Imagem de soja com sintomas de doença (câmera ou galeria) |
| **Procedimentos** | 1. Selecionar imagem da planta via câmera ou galeria <br> 2. Tocar em "Analisar Imagem" <br> 3. Aguardar o processamento observando o indicador de carregamento <br> 4. Verificar o resultado exibido |
| **Resultado esperado** | O indicador de carregamento é exibido durante o processamento; em seguida, o resultado mostra cultura identificada, diagnóstico da doença, causas, recomendações de manejo e o botão para abrir o chat |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-59 — Visualizar histórico de análises no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a aba de histórico do app exibe as análises anteriores do usuário corretamente |
| **Pré-condições** | Usuário autenticado com ao menos uma análise registrada |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Tocar na aba "Histórico" <br> 2. Verificar a lista de análises exibidas |
| **Resultado esperado** | A lista exibe as análises anteriores com nome da doença ou cultura, data e percentuais de confiança de cultura e diagnóstico |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-60 — Filtrar histórico por cultura e período no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se os filtros por cultura e período funcionam corretamente no histórico do app mobile |
| **Pré-condições** | Usuário autenticado com análises de ao menos duas culturas diferentes |
| **Dados de entrada** | Filtro de cultura: Soja / Filtro de período: últimos 30 dias |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Tocar no chip de filtro "Soja" <br> 3. Tocar no chip de período "30 dias" <br> 4. Verificar a lista atualizada |
| **Resultado esperado** | A lista exibe apenas análises de soja realizadas nos últimos 30 dias; análises de outras culturas ou fora do período não aparecem |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-61 — Abrir chat modal a partir do histórico no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o modal de chat abre corretamente com o contexto da análise ao tocar no botão de chat no histórico mobile |
| **Pré-condições** | Usuário autenticado com plano ativo e ao menos um item no histórico |
| **Dados de entrada** | Item do histórico com diagnóstico de doença |
| **Procedimentos** | 1. Acessar a aba "Histórico" <br> 2. Tocar no botão "Chat" de uma análise <br> 3. Digitar e enviar uma pergunta sobre a doença |
| **Resultado esperado** | O modal de chat é aberto com o contexto da análise selecionada; a IA responde à pergunta de forma contextualizada à doença identificada; as mensagens são exibidas em ordem cronológica |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-62 — Visualizar estatísticas de análises no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a aba de estatísticas exibe corretamente os dados agregados das análises do usuário |
| **Pré-condições** | Usuário autenticado com ao menos 3 análises registradas de culturas distintas |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Tocar na aba "Estatísticas" <br> 2. Verificar os cartões e gráficos exibidos |
| **Resultado esperado** | A tela exibe: total de análises realizadas, número de culturas analisadas, confiança média e uma lista das doenças mais frequentes com seus respectivos percentuais |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-63 — Logout no app mobile encerra sessão

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o logout pelo app mobile encerra a sessão e redireciona para a tela inicial |
| **Pré-condições** | Usuário autenticado no aplicativo |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Tocar no botão "Sair" exibido no cabeçalho da tela principal <br> 2. Confirmar a ação se solicitado <br> 3. Observar o redirecionamento |
| **Resultado esperado** | A sessão é encerrada e o usuário é redirecionado para a tela inicial do app; tentativas de acessar o dashboard exigem novo login |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-64 — Contador de uso visível e atualizado no app mobile

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o indicador de uso do plano é exibido e atualizado corretamente após cada análise no app mobile |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar a aba "Nova Análise" e observar o contador de uso exibido <br> 2. Realizar uma análise completa <br> 3. Observar o contador após o resultado ser exibido |
| **Resultado esperado** | O contador exibe o número de análises utilizadas em relação ao limite do plano e é incrementado em 1 após cada análise concluída |
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
| Diagnóstico por IA | 7 |
| Frontend Web (Next.js) | 10 |
| App Mobile (Expo) | 11 |
| **Total** | **64** |
