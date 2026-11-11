# Casos de Teste — Agroscope

> **Projeto:** Agroscope — Plataforma de diagnóstico agrícola com IA  
> **Autor:** Gabriel Schiestl  
> **Pacotes cobertos:** Backend (NestJS), Frontend Web (Next.js), App Mobile (Expo), IA (FastAPI)  
> **Convenção de ID:** CT-XX por módulo sequencial  
> **Casos internos da IA** (API, triagem e modelos, testados com pytest): [`packages/IA/tests/CASOS_DE_TESTE.md`](packages/IA/tests/CASOS_DE_TESTE.md)

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
    | **Procedimentos** | 1. Na tela inicial, clicar em "Entrar" → Janela de login exibida com os campos "Email" e "Senha" e o botão "Entrar" <br> 2. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 3. Preencher o campo de senha com `Senha@123` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema exibe indicador de carregamento e processa as credenciais |
| **Resultado esperado** | O usuário é redirecionado para a tela "Análise de Plantas" com sessão ativa |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Entrar" → Janela de login exibida com os campos "Email" e "Senha" e o botão "Entrar" <br> 2. Deixar o campo de e-mail em branco → Campo de e-mail permanece vazio <br> 3. Preencher o campo de senha com `Senha@123` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema bloqueia o envio e destaca o campo de e-mail com indicação de erro |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Entrar" → Janela de login exibida com os campos "Email" e "Senha" e o botão "Entrar" <br> 2. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 3. Deixar o campo de senha em branco → Campo de senha permanece vazio <br> 4. Clicar em "Entrar" → Sistema bloqueia o envio e destaca o campo de senha com indicação de erro |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Entrar" → Janela de login exibida com os campos "Email" e "Senha" e o botão "Entrar" <br> 2. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 3. Preencher o campo de senha com `senhaErrada` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema exibe indicador de carregamento, processa e retorna mensagem de erro |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Entrar" → Janela de login exibida com os campos "Email" e "Senha" e o botão "Entrar" <br> 2. Preencher o campo de e-mail com `inexistente@email.com` → Campo exibe o texto digitado <br> 3. Preencher o campo de senha com `QualquerSenha@123` → Campo exibe os caracteres mascarados <br> 4. Clicar em "Entrar" → Sistema exibe indicador de carregamento, processa e retorna mensagem de erro genérica |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Entrar" → Janela de login exibida com o link "Esqueceu a senha?" <br> 2. Clicar em "Esqueceu a senha?" → Tela "Esqueceu a senha?" exibida com campo de e-mail <br> 3. Preencher o campo de e-mail com `usuario@email.com` → Campo exibe o texto digitado <br> 4. Clicar em "Enviar código" → Sistema confirma o envio e abre a tela "Redefinir senha" |
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
| **Procedimentos** | 1. Na tela "Redefinir senha", localizar o campo "Código de verificação" → Campo exibido junto de "Nova senha" e "Confirmar nova senha" <br> 2. Digitar o código `000000` e preencher a nova senha nos dois campos → Campos exibem os dados digitados <br> 3. Clicar em "Redefinir senha" → Sistema processa e retorna mensagem de código inválido |
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
| **Procedimentos** | 1. Aguardar mais de 5 minutos após receber o código → Código ultrapassa o prazo de validade de 5 minutos <br> 2. Na tela "Redefinir senha", digitar o código expirado em "Código de verificação" e preencher a nova senha → Campos exibem os dados digitados <br> 3. Clicar em "Redefinir senha" → Sistema processa e retorna mensagem de código expirado |
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
| **Procedimentos** | 1. Na tela "Redefinir senha", digitar o código recebido em "Código de verificação" → Campo exibe os dígitos <br> 2. Digitar `NovaSenha@456` em "Nova senha" e em "Confirmar nova senha" → Campos exibem os caracteres mascarados <br> 3. Clicar em "Redefinir senha" → Sistema confirma a alteração e volta para o login <br> 4. Realizar login com a nova senha → Sistema processa e autentica o usuário |
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
| **Procedimentos** | 1. No web, abrir o menu da conta no cabeçalho ou o menu lateral e clicar em "Sair"; no app, abrir o menu (☰) e tocar em "Sair" → Sessão é encerrada e o usuário volta para a tela inicial <br> 2. Digitar diretamente na barra de endereço a URL de uma área protegida (ex.: `/analytics`) → Sistema detecta ausência de sessão e exibe a tela de login |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Criar Conta" → Janela de cadastro exibida com os campos "Nome Completo", "Email", "Senha", "Confirmar Senha" e o aceite dos termos <br> 2. Preencher "Nome Completo" com `João Silva` → Campo exibe o texto digitado <br> 3. Preencher "Email" com `joao@email.com` → Campo exibe o texto digitado <br> 4. Preencher "Senha" e "Confirmar Senha" com `Senha@123` → Campos exibem os caracteres mascarados <br> 5. Marcar o aceite dos Termos de Uso e clicar em "Criar Conta" → Sistema processa e cria a conta <br> 6. Realizar login com os dados cadastrados → Sistema autentica e abre a tela "Análise de Plantas" |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Criar Conta" → Janela de cadastro exibida com campos vazios <br> 2. Preencher nome, e-mail duplicado e senha → Campos exibem os dados digitados <br> 3. Marcar o aceite dos termos e clicar em "Criar Conta" → Sistema processa, detecta e-mail duplicado e retorna mensagem de erro |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Criar Conta" → Janela de cadastro exibida com campos vazios <br> 2. Preencher somente o campo de e-mail com `joao@email.com` → Apenas o campo de e-mail exibe o texto; nome e senha permanecem vazios <br> 3. Clicar em "Criar Conta" → Sistema bloqueia o envio, destaca nome e senha com indicadores de erro |
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
| **Procedimentos** | 1. Na tela inicial, clicar em "Criar Conta" → Janela de cadastro exibida com campos vazios <br> 2. Preencher o campo de nome com `João` → Campo exibe o texto digitado <br> 3. Preencher o campo de e-mail com `emailinvalido` → Campo exibe o texto digitado sem sinalizar erro imediato <br> 4. Preencher o campo de senha com `Senha@123` → Campo exibe os caracteres mascarados <br> 5. Clicar em "Criar Conta" → Sistema bloqueia o envio e exibe mensagem de validação no campo de e-mail |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido com o campo "Cultura" e o botão "Analisar Imagem" desabilitado <br> 2. Selecionar a cultura "Milho" → Cultura exibida como selecionada <br> 3. Clicar em "Selecionar Imagem" (no app, "Galeria" ou "Câmera") e escolher a foto → Prévia da imagem exibida e botão "Analisar Imagem" habilitado <br> 4. Clicar em "Analisar Imagem" → Indicador de carregamento exibido enquanto o processamento ocorre <br> 5. Aguardar o resultado → Card "Resultado da Análise" exibido com todas as seções preenchidas |
| **Resultado esperado** | O sistema exibe a cultura, o nome da doença com o percentual de confiança, as causas, as recomendações de manejo e os botões "Perguntar à Íris" e "Gerar Relatório PDF" |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido com o botão "Analisar Imagem" desabilitado <br> 2. Selecionar a cultura da folha → Cultura exibida como selecionada <br> 3. Clicar em "Selecionar Imagem" (no app, "Galeria" ou "Câmera") e escolher a foto → Prévia exibida e botão "Analisar Imagem" habilitado <br> 4. Clicar em "Analisar Imagem" → Indicador de carregamento exibido <br> 5. Aguardar o resultado → Card "Resultado da Análise" indica planta saudável |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido sem imagem e com o botão "Analisar Imagem" desabilitado <br> 2. Selecionar a cultura e não escolher nenhuma imagem → Área de prévia permanece vazia <br> 3. Verificar o botão "Analisar Imagem" → Botão permanece desabilitado, sem interação possível |
| **Resultado esperado** | O botão "Analisar Imagem" permanece desabilitado enquanto a cultura e a imagem não estiverem selecionadas |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido <br> 2. Clicar em "Selecionar Imagem" e tentar escolher um arquivo PDF ou documento → O seletor mostra apenas imagens JPG, PNG ou WEBP; nenhuma prévia é exibida <br> 3. Forçar o envio de um arquivo que não é imagem → Sistema exibe mensagem informando que o formato não é suportado |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido <br> 2. Selecionar uma cultura e escolher uma foto sem folha (ex.: um objeto) → Prévia exibida e botão "Analisar Imagem" habilitado <br> 3. Clicar em "Analisar Imagem" → Indicador de carregamento exibido <br> 4. Aguardar o resultado → Sistema recusa a foto e pede a foto de uma folha |
| **Resultado esperado** | A triagem da IA identifica que a foto não é de uma folha; o sistema não exibe diagnóstico e orienta a tirar outra foto |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido <br> 2. Selecionar uma cultura e escolher o arquivo corrompido → Prévia não é exibida ou exibe placeholder de erro <br> 3. Clicar em "Analisar Imagem" → Sistema detecta o arquivo inválido durante o processamento <br> 4. Aguardar resposta → Mensagem de erro amigável é exibida na tela |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido <br> 2. Selecionar uma cultura e escolher a imagem de baixa qualidade → Prévia exibida e botão "Analisar Imagem" habilitado <br> 3. Clicar em "Analisar Imagem" → Indicador de carregamento exibido <br> 4. Aguardar o resultado → Sistema pede uma nova foto (qualidade insuficiente ou confiança abaixo de 80%) |
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
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Contador "Análises: X/X" em vermelho, aviso de limite atingido e botão "Analisar Imagem" desabilitado <br> 2. Selecionar cultura e imagem → Prévia exibida; botão "Analisar Imagem" permanece desabilitado <br> 3. Verificar o botão → Botão desabilitado e mensagem sugerindo upgrade do plano |
| **Resultado esperado** | O botão de análise está desabilitado e a interface indica que o limite do plano foi atingido |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-25 — Selecionar imagem maior que 5 MB

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o sistema recusa imagens acima do limite de 5 MB |
| **Pré-condições** | Usuário autenticado com análises disponíveis |
| **Dados de entrada** | Foto de folha em JPG com mais de 5 MB |
| **Procedimentos** | 1. Após o login, abrir a aba "Nova Análise" da tela "Análise de Plantas" → Card "Upload de Imagem" exibido com a indicação "JPG, PNG ou WEBP (máx. 5 MB)" <br> 2. Web: clicar em "Selecionar Imagem" e escolher a foto de mais de 5 MB → Sistema exibe aviso de tamanho máximo e não carrega a imagem <br> 3. App: tocar em "Galeria", escolher a foto e tocar em "Analisar Imagem" → Sistema exibe o alerta "Imagem muito grande" e não envia a foto |
| **Resultado esperado** | A imagem não é enviada e o sistema informa que o tamanho máximo permitido é 5 MB (backend e IA também recusam arquivos acima desse limite) |
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
| **Procedimentos** | 1. Abrir a aba "Histórico" da tela "Análise de Plantas" → Tela carrega e exibe indicador de carregamento breve <br> 2. Aguardar a lista ser exibida → Lista de análises é renderizada com informações de cada item |
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
| **Procedimentos** | 1. Abrir a aba "Histórico" da tela "Análise de Plantas" → Lista exibida com todas as análises sem filtro <br> 2. Selecionar "Soja" no filtro "Cultura" → Lista atualizada exibindo apenas análises de soja <br> 3. Filtrar o período: no web, escolher uma data no filtro "Data"; no app, tocar em "30 dias" → Lista exibe apenas análises de soja dentro do período |
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
| **Procedimentos** | 1. Abrir a aba "Histórico" da tela "Análise de Plantas" → Lista de análises exibida <br> 2. Clicar sobre uma análise da lista → Tela "Detalhes da Análise" é aberta com todas as informações da análise |
| **Resultado esperado** | O sistema exibe imagem, nome da doença, percentual de confiança, causas e recomendações de manejo |
| **Resultado obtido** | — |
| **Status** | Pendente |
| **Evidências** | — |

---

### CT-29 — Gerar relatório PDF de uma análise

| Campo | Detalhe |
|-------|---------|
| **Objetivo** | Verificar se o usuário de plano pago consegue exportar uma análise em PDF e se o plano gratuito é bloqueado |
| **Pré-condições** | Usuário autenticado no plano PRO ou PREMIUM com ao menos uma análise; um segundo usuário no plano FREE |
| **Dados de entrada** | Análise existente no histórico |
| **Procedimentos** | 1. Com o usuário PRO/PREMIUM, abrir a aba "Histórico" da tela "Análise de Plantas" → Lista de análises exibida <br> 2. Abrir o menu (⋮) de uma análise e clicar em "Gerar relatório" (ou, no card "Resultado da Análise", em "Gerar Relatório PDF") → Texto "Gerando relatório..." exibido e o PDF é baixado <br> 3. Repetir com o usuário FREE → Opção desabilitada e aviso de que relatórios em PDF estão disponíveis nos planos pagos |
| **Resultado esperado** | O PDF é gerado com imagem, cultura, diagnóstico, confiança, causas e recomendações; no plano FREE a geração é bloqueada com aviso de upgrade |
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
| **Procedimentos** | 1. Realizar login como Usuário A → Usuário A é autenticado e direcionado para a área principal <br> 2. Abrir a aba "Histórico" da tela "Análise de Plantas" → Lista carrega exibindo somente as análises do Usuário A <br> 3. Verificar todos os itens listados → Nenhum item pertencente ao Usuário B é visível |
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
| **Procedimentos** | 1. No card "Resultado da Análise", clicar em "Perguntar à Íris" (ou em "Chat" em um item do "Histórico") → Painel de chat exibido com contexto da análise no cabeçalho e campo de texto disponível <br> 2. Digitar a pergunta no campo de texto → Campo exibe o texto digitado <br> 3. Clicar no botão de envio ou pressionar Enter → Mensagem aparece no histórico da conversa e indicador de digitação da IA é exibido <br> 4. Aguardar a resposta → Resposta da IA é exibida na conversa abaixo da mensagem enviada |
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
| **Procedimentos** | 1. Abrir a aba "Histórico" da tela "Análise de Plantas" → Lista de análises exibida <br> 2. Clicar em "Chat" em uma análise que já teve conversa anterior → Painel de chat exibe indicador de carregamento breve <br> 3. Aguardar o carregamento → Mensagens anteriores são exibidas em ordem cronológica |
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
| **Procedimentos** | 1. Abrir a aba "Histórico" da tela "Análise de Plantas" → Lista de análises exibida <br> 2. Clicar em "Chat" em uma análise de soja com ferrugem asiática → Painel de chat abre com saudação inicial da IA já carregada <br> 3. Observar a mensagem de abertura da IA → Mensagem menciona a cultura (Soja) e a doença (Ferrugem Asiática) da análise selecionada |
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
| **Procedimentos** | 1. Clicar em "Perguntar à Íris" ou em "Chat" em uma análise → Painel exibido com aviso de limite atingido e/ou campo de texto desabilitado <br> 2. Tentar digitar uma mensagem → Campo de texto não aceita entrada ou botão de envio permanece desabilitado <br> 3. Tentar clicar no botão de envio → Sistema exibe mensagem informando que o limite foi atingido e bloqueia o envio |
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
| **Procedimentos** | 1. Realizar login no sistema → Usuário autenticado e direcionado para a tela "Análise de Plantas" <br> 2. Na aba "Nova Análise", observar o contador "Análises: X/Y" → Contador mostra as análises usadas e o limite do plano <br> 3. No web, abrir "Configurações" e a aba "Plano" → Barras "Análises de imagem" e "Mensagens à Íris" exibem o uso em relação ao limite <br> 4. Clicar em "Planos" no cabeçalho (no app, menu ☰ → "Planos") → Tela "Planos" exibe os planos, com o selo "Em uso" no plano atual |
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
