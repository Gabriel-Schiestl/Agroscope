# Casos de Teste — Agroscope

> **Projeto:** Agroscope — Plataforma de diagnóstico agrícola com IA  
> **Autor:** Gabriel Schiestl  
> **Pacotes cobertos:** Backend (NestJS), Frontend Web (Next.js), App Mobile (Expo), IA (Flask)  
> **Convenção de ID:** CT-XX por módulo sequencial

---

## Sumário de Módulos

| Faixa | Módulo |
|-------|--------|
| CT-01 a CT-12 | Autenticação (Auth) |
| CT-13 a CT-16 | Usuário (User) |
| CT-17 a CT-25 | Análise de Imagem / Predição |
| CT-26 a CT-30 | Histórico (History) |
| CT-31 a CT-34 | Chat |
| CT-35 | Planos (Plan) |

---

## Módulo: Autenticação

---

### CT-01 — Login com credenciais válidas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue acessar o sistema com e-mail e senha corretos |
| **Pré-condições** | Usuário previamente cadastrado no sistema |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `Senha@123` |
| **Procedimentos** | 1. Acessar a tela de login → Tela exibida com campos de e-mail, senha e botão "Entrar" visíveis <br> 2. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 3. Preencher o campo de senha com `Senha@123` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema exibe indicador de carregamento e processa as credenciais |
| **Resultado esperado** | O usuário é redirecionado para a tela principal com sessão ativa |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-02 — Login com e-mail em branco e senha preenchida

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema bloqueia o login quando o campo de e-mail está vazio |
| **Pré-condições** | Sistema em execução |
| **Dados de entrada** | E-mail: *(em branco)* / Senha: `Senha@123` |
| **Procedimentos** | 1. Acessar a tela de login → Tela exibida com campos de e-mail, senha e botão "Entrar" visíveis <br> 2. Deixar o campo de e-mail em branco → Campo de e-mail permanece vazio <br> 3. Preencher o campo de senha com `Senha@123` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema bloqueia o envio e destaca o campo de e-mail com indicação de erro |
| **Resultado esperado** | O sistema bloqueia o envio e exibe mensagem de validação indicando que o e-mail é obrigatório |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-03 — Login com e-mail preenchido e senha em branco

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema bloqueia o login quando o campo de senha está vazio |
| **Pré-condições** | Sistema em execução |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: *(em branco)* |
| **Procedimentos** | 1. Acessar a tela de login → Tela exibida com campos de e-mail, senha e botão "Entrar" visíveis <br> 2. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 3. Deixar o campo de senha em branco → Campo de senha permanece vazio <br> 4. Clicar em "Entrar" → Sistema bloqueia o envio e destaca o campo de senha com indicação de erro |
| **Resultado esperado** | O sistema bloqueia o envio e exibe mensagem de validação indicando que a senha é obrigatória |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-04 — Login com senha incorreta

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema recusa o acesso com senha errada e exibe mensagem de erro |
| **Pré-condições** | Usuário previamente cadastrado no sistema |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senhaErrada` |
| **Procedimentos** | 1. Acessar a tela de login → Tela exibida com campos de e-mail, senha e botão "Entrar" visíveis <br> 2. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 3. Preencher o campo de senha com `senhaErrada` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema exibe indicador de carregamento, processa e retorna mensagem de erro |
| **Resultado esperado** | O acesso é negado e o sistema exibe mensagem informando que as credenciais são inválidas |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-05 — Login com e-mail não cadastrado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema recusa o acesso quando o e-mail informado não existe |
| **Pré-condições** | Sistema em execução |
| **Dados de entrada** | E-mail: `inexistente@email.com` / Senha: `QualquerSenha@123` |
| **Procedimentos** | 1. Acessar a tela de login → Tela exibida com campos de e-mail, senha e botão "Entrar" visíveis <br> 2. Preencher o campo de e-mail com `inexistente@email.com` → Campo exibe o texto digitado <br> 3. Preencher o campo de senha com `QualquerSenha@123` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema exibe indicador de carregamento, processa e retorna mensagem de erro genérica |
| **Resultado esperado** | O acesso é negado e o sistema exibe mensagem de credenciais inválidas sem revelar qual campo está errado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-06 — Bloqueio de conta após tentativas inválidas

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a conta é bloqueada após múltiplas tentativas de login com senha errada |
| **Pré-condições** | Usuário cadastrado; 4 tentativas incorretas já realizadas |
| **Dados de entrada** | E-mail: `usuario@email.com` / Senha: `senhaErrada` (5ª tentativa) |
| **Procedimentos** | 1. Realizar mais uma tentativa de login com senha incorreta → Sistema exibe mensagem de credenciais inválidas e registra a 5ª tentativa <br> 2. Tentar novamente com a senha correta → Sistema bloqueia o acesso e exibe mensagem de conta bloqueada |
| **Resultado esperado** | O sistema exibe mensagem de conta bloqueada; o login com senha correta também é recusado enquanto o bloqueio estiver ativo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-07 — Solicitar recuperação de senha com e-mail válido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue solicitar recuperação de senha e receber o código por e-mail |
| **Pré-condições** | Usuário cadastrado com e-mail válido |
| **Dados de entrada** | E-mail: `usuario@email.com` |
| **Procedimentos** | 1. Acessar a tela de login → Tela exibida com campos e link "Esqueci minha senha" visível <br> 2. Clicar em "Esqueci minha senha" → Tela/modal de recuperação exibida com campo de e-mail <br> 3. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 4. Confirmar a solicitação → Sistema exibe mensagem de confirmação de envio |
| **Resultado esperado** | O sistema confirma o envio e o usuário recebe o código de recuperação por e-mail |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-08 — Inserir código de recuperação inválido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema recusa um código de recuperação incorreto |
| **Pré-condições** | Código de recuperação enviado ao e-mail do usuário |
| **Dados de entrada** | Código: `000000` (incorreto) |
| **Procedimentos** | 1. Acessar a tela de inserção do código → Tela exibida com campo para os dígitos do código <br> 2. Digitar o código `000000` → Campo exibe os dígitos digitados <br> 3. Confirmar → Sistema processa e retorna mensagem de código inválido |
| **Resultado esperado** | O sistema recusa o código e exibe mensagem informando que o código é inválido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-09 — Inserir código de recuperação expirado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema recusa um código de recuperação após o prazo de validade expirar |
| **Pré-condições** | Código de recuperação gerado há mais de 5 minutos |
| **Dados de entrada** | Código expirado recebido por e-mail |
| **Procedimentos** | 1. Aguardar mais de 5 minutos após receber o código → Código ultrapassa o prazo de validade de 5 minutos <br> 2. Acessar a tela de inserção do código → Tela exibida com campo para os dígitos <br> 3. Digitar o código expirado → Campo exibe os dígitos digitados <br> 4. Confirmar → Sistema processa e retorna mensagem de código expirado |
| **Resultado esperado** | O sistema recusa o código e exibe mensagem informando que o prazo de validade expirou |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-10 — Alterar senha após recuperação bem-sucedida

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue definir nova senha e acessar o sistema com ela |
| **Pré-condições** | Código de recuperação inserido e validado com sucesso |
| **Dados de entrada** | Nova senha: `NovaSenha@456` |
| **Procedimentos** | 1. Na tela de nova senha, digitar `NovaSenha@456` no campo de nova senha → Campo exibe os caracteres mascarados <br> 2. Digitar `NovaSenha@456` no campo de confirmação → Campo exibe os caracteres mascarados <br> 3. Salvar a alteração → Sistema confirma que a senha foi alterada com sucesso <br> 4. Realizar login com a nova senha → Sistema processa e autentica o usuário |
| **Resultado esperado** | A senha é alterada com sucesso e o login com a nova senha é efetuado normalmente |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-11 — Acesso a rota protegida sem autenticação

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se tentar acessar uma área restrita sem estar autenticado redireciona para o login |
| **Pré-condições** | Usuário não autenticado |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Digitar diretamente na barra de endereço a URL de uma área protegida → Sistema detecta ausência de sessão e inicia redirecionamento <br> 2. Aguardar o carregamento → Tela de login é exibida sem que o conteúdo protegido seja carregado |
| **Resultado esperado** | O sistema redireciona para a tela de login sem exibir o conteúdo protegido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-12 — Logout encerra sessão

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o logout encerra a sessão e impede acesso sem nova autenticação |
| **Pré-condições** | Usuário autenticado |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Clicar no botão de logout → Sessão é encerrada e usuário é redirecionado para a tela de login <br> 2. Digitar diretamente na barra de endereço a URL de uma área protegida → Sistema detecta ausência de sessão e exibe a tela de login novamente |
| **Resultado esperado** | O usuário é redirecionado para o login após o logout; tentativa de acesso direto também redireciona |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Usuário

---

### CT-13 — Cadastro com dados válidos

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se um novo usuário consegue se cadastrar e acessar o sistema |
| **Pré-condições** | E-mail não utilizado em cadastro anterior |
| **Dados de entrada** | Nome: `João Silva` / E-mail: `joao@email.com` / Senha: `Senha@123` |
| **Procedimentos** | 1. Acessar a tela de cadastro → Tela exibida com campos de nome, e-mail, senha e botão de cadastro <br> 2. Preencher o campo de nome com `João Silva` → Campo exibe o texto digitado <br> 3. Preencher o campo de e-mail com `joao@email.com` → Campo exibe o texto digitado <br> 4. Preencher o campo de senha com `Senha@123` → Campo exibe os caracteres mascarados <br> 5. Confirmar o cadastro → Sistema processa e cria a conta com sucesso <br> 6. Realizar login com os dados cadastrados → Sistema autentica e redireciona para a área principal |
| **Resultado esperado** | O cadastro é concluído com sucesso e o usuário consegue acessar o sistema |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-14 — Cadastro com e-mail já existente

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede o cadastro com um e-mail já utilizado |
| **Pré-condições** | Usuário com e-mail `joao@email.com` já cadastrado |
| **Dados de entrada** | Nome: `Outro Nome` / E-mail: `joao@email.com` / Senha: `OutraSenha@123` |
| **Procedimentos** | 1. Acessar a tela de cadastro → Tela exibida com campos vazios <br> 2. Preencher nome, e-mail duplicado e senha → Campos exibem os dados digitados <br> 3. Confirmar o cadastro → Sistema processa, detecta e-mail duplicado e retorna mensagem de erro |
| **Resultado esperado** | O cadastro é recusado e o sistema exibe mensagem informando que o e-mail já está em uso |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-15 — Cadastro com campos obrigatórios em branco

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede o cadastro quando campos obrigatórios estão vazios |
| **Pré-condições** | Sistema em execução |
| **Dados de entrada** | Apenas e-mail preenchido: `joao@email.com`; nome e senha em branco |
| **Procedimentos** | 1. Acessar a tela de cadastro → Tela exibida com campos vazios <br> 2. Preencher somente o campo de e-mail com `joao@email.com` → Apenas o campo de e-mail exibe o texto; nome e senha permanecem vazios <br> 3. Tentar confirmar o cadastro → Sistema bloqueia o envio, destaca nome e senha com indicadores de erro |
| **Resultado esperado** | O sistema bloqueia o envio e destaca os campos obrigatórios não preenchidos com mensagens de validação |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-16 — Cadastro com e-mail em formato inválido

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema rejeita e-mail com formato inválido durante o cadastro |
| **Pré-condições** | Sistema em execução |
| **Dados de entrada** | Nome: `João` / E-mail: `emailinvalido` (sem @) / Senha: `Senha@123` |
| **Procedimentos** | 1. Acessar a tela de cadastro → Tela exibida com campos vazios <br> 2. Preencher o campo de nome com `João` → Campo exibe o texto digitado <br> 3. Preencher o campo de e-mail com `emailinvalido` → Campo exibe o texto digitado sem sinalizar erro imediato <br> 4. Preencher o campo de senha com `Senha@123` → Campo exibe os caracteres mascarados <br> 5. Tentar confirmar o cadastro → Sistema bloqueia o envio e exibe mensagem de validação no campo de e-mail |
| **Resultado esperado** | O sistema exibe mensagem de validação indicando que o e-mail não está em formato válido e impede o cadastro |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Análise de Imagem / Predição

---

### CT-17 — Análise de imagem de planta doente — fluxo completo

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema executa o fluxo completo de análise e exibe o diagnóstico correto |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem nítida de planta com sintomas visíveis de doença (ex: milho com ferrugem) |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com área de seleção de imagem e botão de análise desabilitado <br> 2. Selecionar a imagem → Preview da imagem é exibido na tela e o botão de análise é habilitado <br> 3. Iniciar a análise → Indicador de carregamento é exibido enquanto o processamento ocorre <br> 4. Aguardar o resultado → Tela de resultado é exibida com todas as seções preenchidas |
| **Resultado esperado** | O sistema exibe cultura identificada com confiança, nome da doença, causas, recomendações de manejo e opção de abrir chat |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-18 — Análise de imagem de planta saudável

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema identifica e exibe corretamente o resultado para uma planta sem doença |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem de planta saudável sem sintomas visíveis |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com área de seleção e botão desabilitado <br> 2. Selecionar a imagem → Preview exibido e botão de análise habilitado <br> 3. Iniciar a análise → Indicador de carregamento exibido <br> 4. Aguardar o resultado → Tela de resultado exibida indicando planta saudável |
| **Resultado esperado** | O sistema identifica a cultura e indica que a planta está saudável; a análise é salva no histórico |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-19 — Tentar analisar sem selecionar imagem

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede o início da análise quando nenhuma imagem foi selecionada |
| **Pré-condições** | Usuário autenticado na tela de análise |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com área de seleção vazia e botão de análise desabilitado <br> 2. Não selecionar nenhuma imagem → Área de seleção permanece vazia <br> 3. Verificar o estado do botão de análise → Botão permanece desabilitado, sem interação possível |
| **Resultado esperado** | O botão de análise permanece desabilitado enquanto nenhuma imagem estiver selecionada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-20 — Enviar arquivo que não é imagem

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema rejeita o envio de arquivos que não sejam imagens |
| **Pré-condições** | Usuário autenticado na tela de análise |
| **Dados de entrada** | Arquivo PDF ou documento de texto |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com área de seleção de imagem <br> 2. Tentar selecionar um arquivo PDF ou documento no seletor de arquivo → Seletor filtra ou rejeita o arquivo; nenhum preview é exibido <br> 3. Tentar prosseguir com a análise → Sistema exibe mensagem informando que o formato não é suportado |
| **Resultado esperado** | O sistema não aceita o arquivo e exibe mensagem informando que apenas imagens são suportadas |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-21 — Enviar imagem sem planta suportada

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar o comportamento do sistema quando a imagem não contém uma das culturas suportadas |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Foto de paisagem, animal ou objeto sem planta |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com área de seleção <br> 2. Selecionar imagem sem planta → Preview da imagem é exibido e botão de análise é habilitado <br> 3. Iniciar a análise → Indicador de carregamento é exibido <br> 4. Aguardar o resultado → Sistema retorna mensagem informando que nenhuma cultura foi identificada |
| **Resultado esperado** | O sistema informa que não foi possível identificar uma cultura suportada e orienta a tentar com foto adequada |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-22 — Enviar imagem corrompida

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema trata adequadamente um arquivo de imagem corrompido |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Arquivo de imagem com dados inválidos |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com área de seleção <br> 2. Selecionar o arquivo corrompido → Preview não é exibido ou exibe placeholder de erro; botão pode ser habilitado <br> 3. Iniciar a análise → Sistema detecta o arquivo inválido durante o processamento <br> 4. Aguardar resposta → Mensagem de erro amigável é exibida na tela |
| **Resultado esperado** | O sistema exibe mensagem amigável informando que o arquivo não pôde ser processado; a interface permanece funcional |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-23 — Enviar imagem de baixa qualidade

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar o comportamento quando a imagem não permite diagnóstico com confiança suficiente |
| **Pré-condições** | Usuário autenticado com plano ativo e análises disponíveis |
| **Dados de entrada** | Imagem de baixa resolução, muito escura ou desfocada |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com área de seleção <br> 2. Selecionar imagem de baixa qualidade → Preview da imagem é exibido e botão de análise é habilitado <br> 3. Iniciar a análise → Indicador de carregamento exibido <br> 4. Aguardar o resultado → Sistema retorna mensagem de confiança insuficiente para diagnóstico |
| **Resultado esperado** | O sistema informa que não foi possível realizar o diagnóstico com confiança suficiente e orienta a tentar com imagem de melhor qualidade |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-24 — Tentar analisar com limite de análises esgotado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema bloqueia novas análises quando o usuário atingiu o limite do plano |
| **Pré-condições** | Usuário autenticado com todas as análises do plano utilizadas |
| **Dados de entrada** | Qualquer imagem válida |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com contador mostrando o limite atingido em destaque e botão desabilitado <br> 2. Selecionar uma imagem → Preview é exibido; botão de análise permanece desabilitado <br> 3. Verificar o estado do botão → Botão desabilitado com indicação visual de limite atingido |
| **Resultado esperado** | O botão de análise está desabilitado e a interface indica que o limite do plano foi atingido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-25 — Tentar analisar sem plano ativo

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema impede análises para usuários sem plano associado |
| **Pré-condições** | Usuário autenticado sem plano ativo |
| **Dados de entrada** | Qualquer imagem válida |
| **Procedimentos** | 1. Acessar "Nova Análise" → Tela exibida com indicação de ausência de plano ativo <br> 2. Selecionar uma imagem → Preview exibido; botão de análise permanece desabilitado <br> 3. Tentar iniciar a análise → Sistema exibe mensagem sobre necessidade de plano ativo |
| **Resultado esperado** | O sistema exibe mensagem informando que é necessário um plano ativo para realizar análises |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Histórico

---

### CT-26 — Visualizar histórico de análises

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue visualizar todas as suas análises anteriores |
| **Pré-condições** | Usuário autenticado com ao menos uma análise registrada |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Acessar a aba "Histórico" → Tela carrega e exibe indicador de carregamento breve <br> 2. Aguardar a lista ser exibida → Lista de análises é renderizada com informações de cada item |
| **Resultado esperado** | A lista exibe todas as análises com cultura, diagnóstico, data e confiança, ordenadas da mais recente para a mais antiga |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-27 — Filtrar histórico por cultura e período

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se os filtros de cultura e período restringem corretamente os itens exibidos |
| **Pré-condições** | Usuário autenticado com análises de culturas e datas distintas |
| **Dados de entrada** | Cultura: Soja / Período: últimos 30 dias |
| **Procedimentos** | 1. Acessar a aba "Histórico" → Lista exibida com todas as análises sem filtro <br> 2. Selecionar "Soja" no filtro de cultura → Lista é atualizada exibindo apenas análises de soja <br> 3. Selecionar o período dos últimos 30 dias → Lista é filtrada novamente, exibindo apenas análises de soja dentro do período |
| **Resultado esperado** | A lista exibe apenas análises de soja realizadas no período selecionado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-28 — Visualizar detalhes de uma análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue abrir e visualizar todos os detalhes de uma análise anterior |
| **Pré-condições** | Usuário autenticado com ao menos uma análise no histórico |
| **Dados de entrada** | Item do histórico com diagnóstico de doença |
| **Procedimentos** | 1. Acessar a aba "Histórico" → Lista de análises exibida <br> 2. Clicar em "Ver Detalhes" de uma análise → Painel ou tela de detalhes é aberta com todas as informações da análise |
| **Resultado esperado** | O sistema exibe imagem, nome da doença, percentual de confiança, causas e recomendações de manejo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-29 — Confirmar ou contestar diagnóstico

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue marcar um diagnóstico como confirmado ou incorreto |
| **Pré-condições** | Usuário autenticado com ao menos uma análise com status "Não confirmado" |
| **Dados de entrada** | Análise com status pendente de confirmação |
| **Procedimentos** | 1. Acessar a aba "Histórico" → Lista exibida com badges de status visíveis em cada item <br> 2. Abrir detalhes de uma análise com status "Não confirmado" → Painel exibe botões de confirmação e contestação <br> 3. Clicar em "Confirmar Diagnóstico" ou "Marcar como Incorreto" → Status do item é atualizado imediatamente na tela de detalhes e na lista |
| **Resultado esperado** | O status é atualizado para "Confirmado" (badge verde) ou "Incorreto" (badge vermelho) e refletido imediatamente na lista |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-30 — Isolamento de histórico entre usuários

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se um usuário visualiza apenas suas próprias análises, sem acesso às de outros |
| **Pré-condições** | Dois usuários com análises registradas (Usuário A e Usuário B) |
| **Dados de entrada** | Login do Usuário A |
| **Procedimentos** | 1. Realizar login como Usuário A → Usuário A é autenticado e direcionado para a área principal <br> 2. Acessar a aba "Histórico" → Lista carrega exibindo somente as análises do Usuário A <br> 3. Verificar todos os itens listados → Nenhum item pertencente ao Usuário B é visível |
| **Resultado esperado** | Somente as análises do Usuário A são exibidas; nenhuma análise do Usuário B aparece |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Chat

---

### CT-31 — Enviar mensagem de chat em uma análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue enviar uma pergunta sobre uma análise e receber resposta contextualizada |
| **Pré-condições** | Usuário autenticado com mensagens de chat disponíveis; análise realizada |
| **Dados de entrada** | Pergunta: "Quais os cuidados para milho com ferrugem?" |
| **Procedimentos** | 1. Abrir o chat de uma análise → Painel de chat exibido com contexto da análise no cabeçalho e campo de texto disponível <br> 2. Digitar a pergunta no campo de texto → Campo exibe o texto digitado <br> 3. Clicar no botão de envio ou pressionar Enter → Mensagem aparece no histórico da conversa e indicador de digitação da IA é exibido <br> 4. Aguardar a resposta → Resposta da IA é exibida na conversa abaixo da mensagem enviada |
| **Resultado esperado** | A IA responde com informações contextualizadas à doença identificada na análise |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-32 — Rever histórico de conversa de sessão anterior

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se as mensagens de uma sessão anterior são preservadas ao reabrir o chat da mesma análise |
| **Pré-condições** | Usuário com ao menos uma sessão de chat com mensagens registradas |
| **Dados de entrada** | Análise com histórico de conversa |
| **Procedimentos** | 1. Acessar a aba "Histórico" → Lista de análises exibida <br> 2. Abrir o chat de uma análise que já teve conversa anterior → Painel de chat exibe indicador de carregamento breve <br> 3. Aguardar o carregamento → Mensagens anteriores são exibidas em ordem cronológica |
| **Resultado esperado** | As mensagens anteriores são carregadas em ordem cronológica, permitindo continuidade da conversa |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-33 — Abrir chat com contexto correto da análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se a IA apresenta o contexto correto ao abrir o chat de uma análise do histórico |
| **Pré-condições** | Usuário autenticado com ao menos uma análise no histórico |
| **Dados de entrada** | Análise de soja com ferrugem asiática |
| **Procedimentos** | 1. Acessar a aba "Histórico" → Lista de análises exibida <br> 2. Abrir o chat de uma análise específica de soja com ferrugem asiática → Painel de chat abre com saudação inicial da IA já carregada <br> 3. Observar a mensagem de abertura da IA → Mensagem menciona a cultura (Soja) e a doença (Ferrugem Asiática) da análise selecionada |
| **Resultado esperado** | A IA menciona a cultura e a doença identificadas naquela análise específica |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-34 — Tentar enviar mensagem com limite de chat esgotado

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema bloqueia o envio de mensagens quando o limite do plano é atingido |
| **Pré-condições** | Usuário autenticado com todas as mensagens de chat do plano utilizadas |
| **Dados de entrada** | Qualquer pergunta no campo de chat |
| **Procedimentos** | 1. Abrir o painel de chat de uma análise → Painel exibido com aviso de limite atingido e/ou campo de texto desabilitado <br> 2. Tentar digitar uma mensagem → Campo de texto não aceita entrada ou botão de envio permanece desabilitado <br> 3. Tentar clicar no botão de envio → Sistema exibe mensagem informando que o limite foi atingido e bloqueia o envio |
| **Resultado esperado** | O sistema exibe mensagem informando que o limite de mensagens foi atingido; o envio é bloqueado |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Módulo: Planos

---

### CT-35 — Visualizar informações do plano e limites de uso

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário consegue visualizar o plano atual e os limites de análises e mensagens |
| **Pré-condições** | Usuário autenticado com plano ativo |
| **Dados de entrada** | Nenhum |
| **Procedimentos** | 1. Realizar login no sistema → Usuário autenticado e direcionado para a área principal <br> 2. Acessar a área de uso ou plano → Tela carrega exibindo as informações do plano atual com contadores de uso <br> 3. Observar os contadores exibidos → Contadores mostram análises e mensagens utilizadas em relação ao limite total |
| **Resultado esperado** | O sistema exibe análises e mensagens de chat utilizadas em relação ao limite total do plano |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

## Resumo Geral

| Total de Casos | Aprovados | Reprovados | Pendentes |
|---------------|-----------|------------|-----------|
| 35 | 0 | 0 | 35 |

| Módulo | Qtd. Casos |
|--------|-----------|
| Autenticação | 12 |
| Usuário | 4 |
| Análise de Imagem / Predição | 9 |
| Histórico | 5 |
| Chat | 4 |
| Planos | 1 |
| **Total** | **35** |
