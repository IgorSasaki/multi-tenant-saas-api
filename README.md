# Multi-Tenant SaaS API – Desafio Altaa

API backend em **Node.js + Express + TypeScript**, seguindo **Clean Architecture** e princípios **SOLID**, com suporte a **multi-tenant por empresa**, autenticação JWT, convites e gestão de membros.

## 📚 Stack

- **Linguagem**: TypeScript
- **Runtime**: Node.js
- **Framework HTTP**: Express
- **ORM**: Prisma (PostgreSQL)
- **Auth**: JWT + Cookies httpOnly
- **Validação**: Zod
- **Lint/Format**: ESLint + Prettier
- **Execução TS**: tsx
- **Commits**: Commitizen (Conventional Commits)
- **Git Hooks**: Husky + lint-staged

---

## 🚀 Funcionalidades

### Autenticação & Usuários

- **Signup** (`POST /api/auth/signup`)
  - Cria um novo usuário
  - Retorna usuário + JWT
  - Seta cookie `token` httpOnly

- **Login** (`POST /api/auth/login`)
  - Autentica por e-mail/senha
  - Retorna usuário + JWT
  - Seta cookie `token` httpOnly

- **Logout** (`POST /api/auth/logout`)
  - Limpa cookie `token`

- **Quem sou eu** (`GET /api/auth/me`)
  - Retorna o usuário autenticado

### Empresas (Companies)

- **Criar empresa** (`POST /api/company`)
  - Cria uma empresa
  - Cria `membership` do usuário como `OWNER`
  - Se o usuário não tiver `activeCompanyId`, seta essa empresa como ativa

- **Listar minhas empresas** (`GET /api/companies`)
  - Retorna lista paginada de empresas nas quais o usuário é membro
  - Inclui papel do usuário em cada empresa (`userRole`)

- **Selecionar empresa ativa** (`POST /api/company/:id/select`)
  - Atualiza `activeCompanyId` do usuário

- **Detalhes da empresa** (`GET /api/company/:id`)
  - Retorna dados da empresa + membros (memberships)

### Memberships (Membros)

- **Listar membros** (`GET /api/company/:companyId/members`)
  - Lista membros da empresa (paginado)
  - Qualquer membro pode ver (OWNER, ADMIN, MEMBER)
  - Retorna role e dados básicos do usuário

- **Alterar role de membro** (`PATCH /api/membership/:membershipId/role`)
  - Regras de permissão:
    - `MEMBER` não pode alterar
    - `ADMIN` pode alterar `MEMBER`, mas não `OWNER` (nem promover/degradar para `OWNER`)
    - `OWNER` pode alterar qualquer membro
    - Ninguém pode alterar o próprio role (`CannotChangeOwnRoleError`)

- **Remover membro** (`DELETE /api/membership/:membershipId`)
  - Regras de permissão:
    - `MEMBER` não pode remover
    - `ADMIN` não pode remover `OWNER`
    - Não é permitido remover a si mesmo (`CannotRemoveSelfError`)
    - Não é permitido remover o último `OWNER` da empresa (`CannotRemoveLastOwnerError`)

### Convites (Invites)

- **Criar convite** (`POST /api/company/:companyId/invite`)
  - Somente `OWNER` e `ADMIN`
  - `ADMIN` não pode convidar com role `OWNER`
  - Gera token único com expiração de 7 dias
  - Impede convites duplicados ativos para o mesmo e-mail na mesma empresa

- **Listar convites** (`GET /api/company/:companyId/invites`)
  - Somente `OWNER` e `ADMIN`
  - Lista convites (ativos, expirados, usados) com paginação

- **Cancelar convite** (`DELETE /api/company/:companyId/invite/:token`)
  - Somente `OWNER` e `ADMIN`
  - Remove o convite (independente de usado/expirado)

- **Aceitar convite** (`POST /api/invite/:token/accept`)
  - **Público** (não exige auth)
  - Corpo:
    - Para novo usuário: `{ "name": string, "password": string }`
    - Para usuário já autenticado: body vazio (usa o `req.user`)
  - Fluxos:
    - Se usuário NÃO autenticado:
      - Cria usuário com `name`, `password` e e-mail do invite
      - Cria membership com role do invite
      - Marca invite como usado
      - Define empresa do invite como `activeCompanyId` do usuário
      - Gera JWT e seta cookie `token` httpOnly
    - Se usuário autenticado:
      - Verifica se e-mail do usuário é igual ao do invite
      - Verifica se já não é membro da empresa
      - Cria membership
      - Marca invite como usado

---

## 🧱 Arquitetura

Camadas principais:

- `src/domain`
  - `entities`: modelos de domínio (User, Company, Membership, Invite)
  - `errors`: erros de domínio (UserAlreadyExistsError, CompanyNotFoundError, etc.)
  - `enums`: enums como `Role`

- `src/repositories`
  - Abstrações de acesso a dados usando Prisma
  - `UserRepository`, `CompanyRepository`, `MembershipRepository`, `InviteRepository`

- `src/use-cases`
  - Casos de uso focados em regras de negócio
  - Ex.: `CreateCompanyUseCase`, `SelectActiveCompanyUseCase`, `ListCompanyMembersUseCase`, `CreateInviteUseCase`, `AcceptInviteUseCase` etc.

- `src/controllers`
  - Adaptadores HTTP (Express) que chamam os use cases

- `src/routes`
  - Definição das rotas Express e wiring de dependências

- `src/middlewares`
  - `auth.middleware.ts` — valida JWT (cookie ou header), carrega `req.user`

- `src/config`
  - `env.ts` — valida variáveis de ambiente com Zod
  - `prisma.ts` — client do Prisma

---

## 📂 Estrutura do projeto

```
src/
  config/
    env.ts
    prisma.ts
  domain/
    entities/
      user.entity.ts
      company.entity.ts
      membership.entity.ts
      invite.entity.ts
    enums/
      role.enum.ts
    errors/
      user.errors.ts
      company.errors.ts
      membership.errors.ts
      invite.errors.ts
  repositories/
    user.repository.ts
    company.repository.ts
    membership.repository.ts
    invite.repository.ts
  use-cases/
    user/
      create-user.use-case.ts
      authenticate-user.use-case.ts
      get-user-profile.use-case.ts
      update-active-company.use-case.ts
    company/
      create-company.use-case.ts
      list-user-companies.use-case.ts
      select-active-company.use-case.ts
      get-company-details.use-case.ts
    membership/
      list-company-members.use-case.ts
      update-member-role.use-case.ts
      remove-member.use-case.ts
    invite/
      create-invite.use-case.ts
      accept-invite.use-case.ts
      list-company-invites.use-case.ts
      cancel-invite.use-case.ts
  controllers/
    auth.controller.ts
    company.controller.ts
    membership.controller.ts
    invite.controller.ts
  middlewares/
    auth.middleware.ts
  routes/
    auth.routes.ts
    company.routes.ts
    membership.routes.ts
    invite.routes.ts
  utils/
    jwt.util.ts
  types/
    express.d.ts
  app.ts
  server.ts

prisma/
  schema.prisma
  seed.ts
```

---

## 🔧 Configuração

### Variáveis de ambiente

Arquivo `.env` na raiz:

```env
PORT=3333
CORS_ORIGIN=*
NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/altaa_db?schema=public"

JWT_SECRET="uma-chave-bem-grande-e-segura-aqui-com-32+caracteres"
JWT_EXPIRES_IN="7d"
```

### Validação do `.env` (src/config/env.ts)

- Usa **Zod** para garantir que:
  - `DATABASE_URL` é uma URL válida
  - `JWT_SECRET` existe e tem tamanho mínimo
  - `PORT` é convertido para número
  - `NODE_ENV` é `development | production | test`

---

## 🗃️ Banco de Dados & Prisma

### Instalar dependências

```bash
pnpm install
```

### Rodar migrations

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

Ou diretamente:

```bash
npx prisma generate
npx prisma migrate dev
```

### Rodar seed

```bash
pnpm prisma:seed
```

Ou via Prisma:

```bash
npx prisma db seed
```

Para resetar banco e rodar seed automaticamente:

```bash
pnpm prisma:reset
```

O seed cria:

- **5 usuários** com senha `password123`
- **4 empresas**
- **9 memberships** com roles variados (`OWNER`, `ADMIN`, `MEMBER`)
- **5 convites** em diferentes estados (válido, expirado, usado, para usuário existente etc.)

**Principais usuários de teste:**

- `joao.silva@techsolutions.com` – senha `password123`
- `maria.santos@techsolutions.com` – senha `password123`
- `pedro.oliveira@digitalmarketing.com` – senha `password123`
- `ana.costa@startup.com` – senha `password123`
- `carlos.mendes@freelancer.com` – senha `password123`

---

## ▶️ Execução

### Desenvolvimento

```bash
pnpm dev
```

- Usa `tsx` para rodar `src/server.ts` com watch
- Loga no console o status da conexão com o banco e a porta

### Produção (build + start)

```bash
pnpm build
pnpm start
```

---

## 🧪 Testes manuais via cURL

### Login

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@techsolutions.com",
    "password": "password123"
  }'
```

### Criar empresa

```bash
curl -X POST http://localhost:3333/api/company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Minha Nova Empresa",
    "logoUrl": "https://ui-avatars.com/api/?name=Nova+Empresa"
  }'
```

### Listar empresas

```bash
curl -X GET "http://localhost:3333/api/companies?page=1&pageSize=10" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Listar membros da empresa

```bash
curl -X GET "http://localhost:3333/api/company/COMPANY_ID/members" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Criar convite

```bash
curl -X POST "http://localhost:3333/api/company/COMPANY_ID/invite" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "email": "novo.dev@example.com",
    "role": "MEMBER"
  }'
```

### Aceitar convite (novo usuário)

```bash
curl -X POST "http://localhost:3333/api/invite/TOKEN_DO_CONVITE/accept" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Desenvolvedor",
    "password": "password123"
  }'
```

---

## ✅ Qualidade de código

### Lint & Format

- **ESLint** com TypeScript
- **Prettier** (sem ponto e vírgula, aspas simples)
- **Plugins**:
  - `eslint-plugin-import-helpers` - organização de imports
  - `eslint-plugin-perfectionist` - ordenação alfabética
  - `eslint-plugin-unused-imports` - remove imports não usados

**Scripts disponíveis:**

```bash
pnpm lint          # Verifica problemas
pnpm lint:fix      # Corrige automaticamente
pnpm format        # Formata código
pnpm format:check  # Verifica formatação
pnpm type-check    # Verifica tipos TypeScript
```

### Git Hooks (Husky + lint-staged)

- **Pre-commit**: roda ESLint e Prettier automaticamente nos arquivos staged
- **Commit-msg**: valida mensagem de commit (Conventional Commits)
- **Prepare-commit-msg**: abre Commitizen para commits padronizados

### Commitizen

Para fazer commits padronizados:

```bash
pnpm commit
```

Ou use o git hook automático:

```bash
git commit
```

---

## 📦 Scripts disponíveis

```bash
pnpm dev                    # Desenvolvimento com watch
pnpm build                  # Build TypeScript
pnpm start                  # Produção (após build)

pnpm lint                   # Lint
pnpm lint:fix               # Lint + fix
pnpm format                 # Format
pnpm format:check           # Verifica formatação
pnpm type-check             # Type check

pnpm prisma:generate        # Gera Prisma Client
pnpm prisma:migrate         # Roda migrations (dev)
pnpm prisma:migrate:prod    # Roda migrations (prod)
pnpm prisma:studio          # Abre Prisma Studio
pnpm prisma:seed            # Roda seed
pnpm prisma:reset           # Reset DB + migrations + seed

pnpm commit                 # Commit com Commitizen
```

---

## 🔐 Segurança

- **Helmet**: headers de segurança HTTP
- **CORS**: configurável via `CORS_ORIGIN`
- **Rate Limiting**: proteção contra DDoS
- **JWT**: tokens com expiração configurável
- **Cookies httpOnly**: proteção contra XSS
- **Bcrypt**: hash de senhas com salt rounds

---

## 📝 Licença

MIT

---

## 👤 Autor

**Igor Sasaki**

- GitHub: [@IgorSasaki](https://github.com/IgorSasaki)
- Email: igor-sasaki@hotmail.com
