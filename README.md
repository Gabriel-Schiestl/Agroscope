# AgroScope 🌾

**Diagnóstico de doenças em plantas por foto, com inteligência artificial, para o pequeno produtor rural.**

O produtor fotografa uma folha da lavoura com o celular, escolhe a cultura e, em segundos, recebe o diagnóstico com o grau de confiança da IA, as possíveis causas e recomendações de manejo. O AgroScope funciona no navegador (web) e no aplicativo para celular.

---

## O problema e a proposta

Doenças foliares como as ferrugens se espalham rápido e, quando são percebidas tarde, já comprometeram parte da produção. O pequeno produtor nem sempre tem um agrônomo por perto para uma avaliação imediata.

O AgroScope oferece uma **orientação inicial rápida e acessível**: basta uma foto. O resultado não substitui a avaliação de um agrônomo — a própria aplicação recomenda confirmar o diagnóstico com um profissional — mas ajuda o produtor a agir cedo.

---

## O que a aplicação faz

| Recurso | Descrição |
|---|---|
| **Diagnóstico por foto** | O usuário escolhe a cultura, envia a foto de uma folha (JPG, PNG ou WEBP, até 5 MB) e recebe a doença identificada ou "planta saudável", com a confiança da IA. |
| **Triagem da imagem** | Antes do diagnóstico, um modelo verifica se a foto é de uma folha e se tem qualidade suficiente; se não tiver, pede outra foto. Diagnósticos com confiança abaixo de 80% não são exibidos. |
| **Explicação e manejo** | Para cada diagnóstico, a aplicação mostra a explicação, as causas, as recomendações de manejo e os cuidados. |
| **Validação com o clima** | Com a localização liberada, o diagnóstico é comparado com o clima dos últimos 7 dias da região (Open-Meteo) para indicar se a doença é provável naquelas condições. |
| **Assistente Íris** | Chat para tirar dúvidas sobre cada análise ("Perguntar à Íris"). |
| **Histórico e estatísticas** | Todas as análises ficam salvas, com busca, filtros por cultura e data e gráficos das doenças e culturas mais analisadas. |
| **Relatório em PDF** | Exportação de uma análise em PDF (planos pagos). |
| **Planos** | FREE (10 análises e 50 mensagens à Íris por mês), PRO e PREMIUM (limites maiores e relatório em PDF). Os limites são renovados todo dia 1º. |
| **Conta e segurança** | Cadastro com aceite dos Termos de Uso (LGPD), login, recuperação de senha por código enviado por e-mail e bloqueio após tentativas inválidas. |

### Culturas e doenças reconhecidas

São **5 modelos de IA, um por cultura**, cada um com 3 classes: **15 classes no total — 10 doenças e a folha saudável de cada cultura**.

| Cultura | Doenças | Modelo |
|---|---|---|
| Café | Ferrugem do cafeeiro, Mancha de Phoma | v2 |
| Soja | Ferrugem asiática, Crestamento bacteriano | v2 |
| Tomate | Pinta bacteriana, Mofo das folhas | v2 |
| Trigo | Ferrugem parda, Ferrugem amarela | v1 |
| Milho | Ferrugem polissora, Ferrugem comum | v1 |

Detalhes dos modelos, acurácia nos testes e como adicionar culturas: [`packages/IA/README.md`](packages/IA/README.md).

---

## Como funciona

```
 Web (Next.js) ─┐                        ┌─► IA (FastAPI + PyTorch)
                ├─► Backend (NestJS) ────┤     triagem da foto + modelo da cultura
 App (Expo)  ───┘     │                  ├─► Gemini: explicação, manejo e chat da Íris
                      │                  └─► Open-Meteo: clima recente da região
                      ├─► PostgreSQL: usuários, planos, limites, histórico, chat
                      └─► RabbitMQ: envio de e-mails (recuperação de senha)
```

1. O usuário escolhe a cultura e envia a foto pelo web ou pelo app.
2. O backend valida a sessão e o limite do plano e envia a foto para a IA.
3. A IA faz a **triagem** (é folha? qualidade ok?) e passa a foto ao **modelo da cultura**, que devolve a classe e a confiança.
4. O backend completa o resultado com explicação e manejo, compara com o clima da região e salva no histórico.
5. O resultado aparece na tela, e o usuário pode conversar com a Íris ou gerar o relatório em PDF.

---

## Estrutura do repositório

| Pasta | O que é | Tecnologias |
|---|---|---|
| [`packages/frontend`](packages/frontend) | Aplicação web | Next.js 14, React 18, Tailwind CSS, shadcn/ui, Recharts, React-PDF |
| [`packages/app`](packages/app) | Aplicativo para celular (Android, iOS e web) | Expo, React Native |
| [`packages/backend`](packages/backend) | API principal: autenticação, planos, limites, análises, histórico e chat | NestJS 11, TypeORM, PostgreSQL, Socket.IO, RabbitMQ, Gemini |
| [`packages/IA`](packages/IA) | API de diagnóstico: triagem e modelos por cultura | FastAPI, PyTorch/torchvision (ConvNeXt, EfficientNet, MobileNet), OpenCV, Pillow, NumPy |
| [`packages/e2e-web`](packages/e2e-web) | Testes de sistema da aplicação web | Playwright |

Documentos na raiz:

- [`Casos_de_Teste_Agroscope.md`](Casos_de_Teste_Agroscope.md) — casos de teste funcionais (planilhas `.xlsx` com as mesmas informações).
- [`DEPLOY_EC2.md`](DEPLOY_EC2.md) — implantação em servidor (AWS EC2 com nginx).

---

## Como executar

Cada pacote tem seu próprio README com as instruções completas. Resumo:

```bash
# IA (precisa dos arquivos de modelo em packages/IA/models, fora do Git)
cd packages/IA && cp .env.example .env && pip install -r requirements.txt && python app.py

# Backend (PostgreSQL e RabbitMQ configurados no .env)
cd packages/backend && cp .env.example .env && npm install && npm run start:migration

# Web
cd packages/frontend && cp .env.example .env && npm install && npm run dev

# App
cd packages/app && cp .env.example .env && npm install && npx expo start
```

Também há um `docker-compose.yml` na raiz para subir backend, web e nginx.

---

## Testes

- **Backend:** testes unitários e e2e com Jest (`npm test`, `npm run test:e2e`).
- **IA:** testes da API, dos casos de uso e do comportamento dos modelos com pytest ([`packages/IA/tests`](packages/IA/tests)).
- **Web:** testes de sistema com Playwright ([`packages/e2e-web`](packages/e2e-web)).
- **Casos de teste manuais:** [`Casos_de_Teste_Agroscope.md`](Casos_de_Teste_Agroscope.md) e [`packages/IA/tests/CASOS_DE_TESTE.md`](packages/IA/tests/CASOS_DE_TESTE.md).

Os testes rodam no GitHub Actions ([`.github/workflows/tests.yml`](.github/workflows/tests.yml)).
