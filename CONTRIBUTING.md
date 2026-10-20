# Contributing

Build with Clerk is a gallery of **products**, not demos. Every example is a complete app someone could ship, built around one Clerk feature. Read this before proposing or building one.

## The five checks

A project ships only when all five are true. The PR template asks for each.

1. **A real domain with a real auth problem.** The product would exist without Clerk, and Clerk solves its auth better than hand-rolling. "Todo app with login" fails this.
2. **One hero feature.** The headline names a single Clerk feature (passkeys, device flow, organizations, multi-session, billing...). Others may appear, but one leads.
3. **Try it in under 60 seconds.** A public demo with a "Try as demo user" button backed by a server-minted sign-in token. Nobody creates an account to look.
4. **Readable in an afternoon.** Roughly 2,000 lines of application code or fewer. Bigger means two examples.
5. **A real backend that verifies tokens.** Client-only auth is not an example of anything.

## Proposing a project

Open an issue with the "Propose a project" template. Say what the product is, which Clerk feature leads, and why a stranger would want to clone it. Projects on the [catalog](docs/CATALOG.md) backlog are pre-approved; claim one by commenting.

## Building one

1. Create `examples/<slug>/` from scratch or by copying the closest sibling. JS/TS examples get a `package.json` and join the pnpm workspace; Godot, Go and Python examples get a `Makefile` with `make dev` and `make test`.
2. Create a Clerk application for it. Never reuse keys from another example.
3. Write `.env.example` with every variable and a comment on where it comes from.
4. Write `README.md` (English) and `README.es.md` (Spanish). A stranger gets to a running app in under ten minutes.
5. Write `project.mdx` next to the code: this becomes `/p/<slug>` on the site. Optional `project.es.mdx` for Spanish.
6. Add the entry to `packages/registry/src/projects/index.ts` with an en/es title, tagline, description, the hero feature, and a city position in the right district. `pnpm registry:check` validates it.
7. Mount `<ClerkKey />` after sign-in so the city can hand out the project's key (from M3 on).
8. Deploy. Web demos go to `<slug>.buildwithclerk.com`.

## Code style

- TypeScript strict, Biome for lint and format: `pnpm lint:fix`.
- English in code, comments and commit messages.
- Commits are small and incremental: one logical step each, conventional prefixes (`feat`, `fix`, `docs`, `chore`).
- No analytics or tracking in examples. Clean code is the product.

## Site

`apps/web` is the gallery and the city. Its design follows clerk.com's tokens (see `packages/ui`). The city's design is in [GDD.md](GDD.md); do not add mechanics that are not in it without updating it first.
