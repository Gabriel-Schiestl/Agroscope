# Backend — Agroscope

## Visão Geral

Backend NestJS do Agroscope: plataforma de diagnóstico agrícola que analisa imagens de plantas para identificar doenças via IA. Recebe imagens, envia para processamento via RabbitMQ, armazena histórico e gerencia usuários/planos.

---

## Stack

| Categoria | Tecnologia |
|---|---|
| Framework | NestJS 11 + Express |
| Linguagem | TypeScript 5.1 |
| Banco de dados | PostgreSQL + TypeORM 0.3 |
| Mensageria | RabbitMQ (amqplib) |
| Autenticação | JWT + AES (cookies httpOnly) |
| Validação | class-validator + class-transformer |
| Segurança | Helmet, CSRF (csrf-csrf), bcryptjs |
| Rate limiting | @nestjs/throttler (3 tiers: short/medium/long) |
| Testes | Jest |

---

## Arquitetura

O projeto segue **Clean Architecture** com influências de **Hexagonal Architecture (Ports & Adapters)**, organizando o código em camadas com dependência sempre apontando para dentro (domain).

### Camadas (de dentro para fora)

```
Domain → Application → Infrastructure
                     ↑
              Controllers (Presentation)
```

**Domain** — regras de negócio puras, sem dependências externas
- Entidades com construtores privados (factory methods `create` / `load`)
- Interfaces de repositórios (contratos)
- Interfaces de serviços de domínio

**Application** — orquestração dos casos de uso
- Use cases (estendem `AbstractUseCase`)
- DTOs de entrada/saída
- Mappers domain ↔ DTO
- Queries (leitura sem efeitos colaterais)

**Infrastructure** — implementações concretas
- Repositórios TypeORM (`*Data.repository.ts`)
- Models/entidades do banco (`*.model.ts`)
- Mappers domain ↔ model
- Serviços externos (JWT, AES, Predict, email)
- Migrations

**Controllers (Presentation)** — camada HTTP
- Recebem requisições, chamam use cases, retornam `Result`
- O `ResponseInterceptor` global converte `Result` em respostas HTTP

---

## Estrutura de Pastas

```
src/
├── app.module.ts               # Módulo raiz
├── main.ts                     # Bootstrap
│
├── modules/
│   ├── auth/                   # Autenticação e credenciais
│   │   ├── application/        # Use cases + DTOs
│   │   ├── domain/             # Authentication entity, repos, services
│   │   ├── infra/              # TypeORM impl, guards, AES service
│   │   └── controllers/        # Auth.controller.ts
│   │
│   └── core/                   # Domínio principal
│       ├── application/        # Use cases, queries, DTOs, mappers
│       ├── domain/             # User, Plan, Limit, History, Sickness, Knowledge
│       ├── infra/              # Repos, models, migrations, services
│       └── controllers/        # User, Plan, core controllers
│
└── shared/
    ├── Result.ts               # Tipo Result (Success | Failure)
    ├── AbstractUseCase.ts      # Base class para use cases
    ├── Exception.ts            # Base de exceções
    ├── Response.interceptor.ts # Converte Result → HTTP response
    ├── exceptions/             # BusinessException, TechnicalException
    └── shared.module.ts
```

---

## Padrões Fundamentais

### Result Type

Todos os use cases e operações de domínio retornam `Result<E, T>` — nunca lançam exceções para fluxo de negócio.

```typescript
// Definição
type Result<E, T> = Success<T> | Failure<E>

// Criação
Res.success(value)   // Result<never, T>
Res.failure(error)   // Result<E, never>

// Uso
const result = await useCase.execute(data);
if (result.isFailure()) {
  // result.error: E
}
// result.value: T
```

### AbstractUseCase

Todos os use cases estendem `AbstractUseCase<Params, Error, Return>`:

```typescript
class MyUseCase extends AbstractUseCase<MyDto, BusinessException, MyOutput> {
    protected async onExecute(data: MyDto): Promise<Result<BusinessException, MyOutput>> {
        // implementação
    }
}
```

O `AbstractUseCase` adiciona logging automático (início, duração, erros) e tratamento de exceções inesperadas.

### Entidades de Domínio

Construtores são **sempre privados**. Uso obrigatório de factory methods:

```typescript
// Criação nova (com validações) → retorna Result
Authentication.create(props): Result<BusinessException, Authentication>

// Reconstituição do banco (sem validações) → retorna instância direta
Authentication.load(props, id): Authentication
```

Propriedades privadas com `#` (private fields ES2022) — expostas somente via getters.

### Injeção de Repositórios

Repositórios são injetados via string token (interface, não classe concreta):

```typescript
@Inject('UserRepository') private userRepo: UserRepository
```

Os tokens são registrados nos módulos:
```typescript
{ provide: 'UserRepository', useClass: UserDataRepository }
```

### ResponseInterceptor

Global — converte automaticamente o `Result` retornado pelo controller em resposta HTTP:

| Resultado | Método | HTTP Status |
|---|---|---|
| `Success` | POST | 201 Created |
| `Success` | GET/PUT/PATCH/DELETE | 200 OK |
| `Failure` | GET | 404 Not Found |
| `Failure` | outros | 400 Bad Request |

---

## Autenticação

**Fluxo:**
1. `POST /auth/login` → credenciais → JWT gerado + criptografado com AES
2. Token armazenado em cookie httpOnly: `agroscope-authentication`
3. `AuthGuard` (global) intercepta toda requisição, descriptografa e valida o JWT
4. Payload do JWT (`{ id }`) disponível em `request.user`

**Rotas públicas:** decoradas com `@Public()` — o guard as ignora.

**Proteção de conta:** após 5 tentativas incorretas de senha, a conta é bloqueada (`verifyAuthenticationBlocked()`).

**Recuperação de senha:** token de 6 dígitos com expiração de 5 minutos, máximo 4 tentativas.

**CSRF:** token via `GET /auth/csrf/token`, validado em todas as requisições de mutação.

---

## Banco de Dados

**TypeORM com migrations obrigatórias** — `synchronize` está desabilitado.

```bash
npm run migration:generate   # gera migration baseada nas entidades
npm run migration:run        # executa migrations pendentes
npm start:migration          # executa migrations + sobe o servidor em watch mode
```

**Entidades TypeORM** vivem em `infra/models/*.model.ts`. As entidades de domínio e os models de ORM são **separados** — existe um mapper para converter entre eles.

**Variável de ambiente:** `DB_URL` (connection string PostgreSQL). SSL opcional via `DB_SSL=true`.

---

## Mensageria (RabbitMQ)

Duas filas principais:
- `images` — envio de imagens para processamento de predição por IA
- `email-service` — envio de emails (recuperação de senha, notificações)

Producers vivem em `shared/domain/` e `shared/infra/`. O resultado da predição é consumido de volta de forma assíncrona.

---

## Módulos

### AuthModule

Responsável exclusivamente por credenciais e sessão. **Não** gerencia dados do usuário de negócio — isso é responsabilidade do CoreModule.

A criação de um novo usuário no CoreModule dispara um evento `user.created` (via `EventEmitter2`) que o AuthModule escuta para criar o registro de autenticação correspondente.

### CoreModule

Domínio principal:
- **User** — dados do usuário (nome, email, plano, limites)
- **Plan** — planos de assinatura com limites configurados
- **Limit** — controle de uso por usuário (imagens, chats)
- **History** — histórico de predições realizadas
- **Sickness** — catálogo de doenças identificáveis
- **Knowledge** — base de conhecimento vinculada a cada doença
- **Image** — armazenamento de imagens enviadas

### SharedModule

Provedores globais: producers RabbitMQ, serviços de email, interceptors.

---

## Exceções

Hierarquia de exceções:

```
Exception (base, estende Error)
├── BusinessException   → erros de regra de negócio (400/404)
└── TechnicalException  → erros de infraestrutura/sistema
    └── RepositoryNoDataFound → entidade não encontrada
```

Sempre use `BusinessException` para erros de domínio e retorne via `Res.failure(...)` — nunca lance exceções para fluxo de negócio.

---

## Rate Limiting

Configurado via variáveis de ambiente com 3 tiers:

```
THROTTLE_SHORT_TTL / THROTTLE_SHORT_LIMIT
THROTTLE_MEDIUM_TTL / THROTTLE_MEDIUM_LIMIT
THROTTLE_LONG_TTL / THROTTLE_LONG_LIMIT
```

Aplicado globalmente via `ThrottlerGuard`. Por rota use `@Throttle({ short: {...} })`.

---

## Testes

- Testes unitários de domínio em `domain/models/__test__/*.spec.ts`
- Testes de model/infra em `infra/models/__test__/*.spec.ts`
- Testes e2e em `test/`
- Runner: `jest` com config em `jest.config.ts`

```bash
npm test          # unit tests
npm run test:e2e  # end-to-end tests
```

---

## Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Entidade de domínio | `PascalCase.ts` | `Authentication.ts` |
| Model TypeORM | `PascalCase.model.ts` | `Authentication.model.ts` |
| Repositório (interface) | `PascalCase.repository.ts` | `Authentication.repository.ts` |
| Repositório (impl) | `PascalCaseData.repository.ts` | `AuthenticationData.repository.ts` |
| Use case | `PascalCase.usecase.ts` | `Login.usecase.ts` |
| Mapper | `PascalCase.mapper.ts` | `Authentication.mapper.ts` |
| DTO | `PascalCase.dto.ts` | `User.dto.ts` |
| Controller | `PascalCase.controller.ts` | `Auth.controller.ts` |
| Guard/Interceptor | `PascalCase.guard.ts` / `PascalCase.interceptor.ts` | `Auth.guard.ts` |
| Testes | `__test__/PascalCase.spec.ts` | `__test__/Authentication.spec.ts` |

---

## Scripts Úteis

```bash
npm run start:dev        # desenvolvimento com hot reload
npm start:migration      # migrations + hot reload
npm run build            # compilar para produção
npm run migration:run    # rodar migrations
npm run migration:generate -- --name NomeDaMigration
npm test
npm run test:e2e
```
