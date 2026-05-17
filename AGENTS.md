# AGENTS.md — Workio

## Project

Enterprise workflow automation platform. Next.js 16 App Router, PostgreSQL, Better Auth, Vercel AI SDK agents.

## Commands

```
npm run dev        # Dev server with Turbopack
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier (ts/tsx)
npm run typecheck  # tsc --noEmit (always run before commit)
```

No test framework is configured.

## Architecture

**Route groups:** `(auth)` for sign-in/sign-up, `(dashboard)` for protected pages with sidebar layout.
**Entry points:** `app/page.tsx` (landing), `app/(auth)/sign-in/page.tsx`, `app/(dashboard)/page.tsx`.

| Directory | Purpose |
|-----------|---------|
| `app/(auth)/` | Auth pages (split-layout, no sidebar) |
| `app/(dashboard)/` | Protected pages (sidebar + topbar layout) |
| `app/api/auth/[...all]/` | Better Auth handler |
| `app/api/workflows/` | Workflow CRUD |
| `app/api/teams/` | Team CRUD + members |
| `app/api/agents/workflow/` | AI agent streaming execution |
| `app/api/executions/` | Workflow execution history |
| `app/api/api-keys/` | Stored credentials CRUD |
| `app/api/activity/` | Activity feed |
| `components/workflow/` | Canvas, nodes, palette, properties, toolbar |
| `components/layout/` | Sidebar (desktop + mobile sheet), topbar |
| `lib/agents/` | ToolLoopAgent + AI tools (email, http, slack, database) |
| `lib/services/` | External service wrappers (email, http, slack, discord, crm, scheduler, condition) |
| `lib/workflow/node-registry.ts` | 24 node types across 11 categories |
| `generated/prisma/` | Prisma client output (NOT in node_modules) |

## Database

**Prisma v7** with `@prisma/adapter-pg` + `pg.Pool`. Client generated to `generated/prisma/`.

```bash
npx prisma migrate dev --name <name>   # After schema change
npx prisma generate                     # Re-generate client
```

**12 models:** User, Account, Session, Verification, Workflow, WorkflowExecution, ApiKey, Team, TeamMember, WorkflowPermission, Activity.

**Singleton pattern:** `lib/db.ts` uses `globalForPrisma` to prevent multiple instances in dev.

## Auth

**Better Auth** (`better-auth/minimal` for tree-shaking) with Prisma adapter.
- Email/password + Google OAuth
- Session via cookie (`better-auth.session_token`)
- Route protection in `app/middleware.ts` checks cookie presence
- Server session: `auth.api.getSession({ headers: await getHeaders() })`
- Client session: `useSession()` from `lib/auth-client.ts`
- Admin role gate: check `session.user.role === "admin"`

## AI Agents

**AI SDK v6** (`ai@6.x`) with `ToolLoopAgent` + `openai("gpt-4o")`.
- `tool()` takes a single object: `{ description, inputSchema, execute }`
- `inputSchema` uses Zod v4 — `z.record(z.string(), z.unknown())` (two args required)
- Agent tools live in `lib/agents/tools/`; streaming route in `app/api/agents/workflow/route.ts`

## Key Patterns

- **Tailwind v4**: `@import "tailwindcss"` in `globals.css`, not PostCSS plugins. OKLCH colors.
- **Class merging**: always use `cn()` from `@/lib/utils`.
- **shadcn/ui**: `npx shadcn@latest add <name>`. Imports from `@/components/ui/*`.
- **Client components**: all workflow files need `'use client'` (drag-and-drop).
- **Error boundaries**: `GlobalErrorBoundary` in root layout, `ErrorBoundary` per-dashboard section.
- **Toast notifications**: `sonner` — `toast.success()`, `toast.error()`, `toast.info()`.
- **Icons**: lucide-react names as strings in node registry, resolved via `iconMap` in palette.

## Gotchas

- Prisma client is at `@/generated/prisma/client`, NOT `@prisma/client`.
- `z.record()` in Zod v4 requires key + value types: `z.record(z.string(), z.unknown())`.
- `tsconfig.json` includes `generated/**/*.ts` — do not remove.
- `prisma.config.ts` loads env via `import "dotenv/config"`.
- `components/gitkeep` and `lib/gitkeep` are empty placeholders — safe to ignore.
- `next.config.mjs` is minimal (no rewrites, redirects, or image config).
- Required `.env` vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OPENAI_API_KEY`.
