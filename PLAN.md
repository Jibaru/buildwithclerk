# Plan

Decisions from the design interview on 2026-10-19. The city's game design is in [GDD.md](GDD.md); the project list is in [docs/CATALOG.md](docs/CATALOG.md).

## What we are building

- **buildwithclerk.com**: an official Clerk gallery of real products built with Clerk, started in `jibaru/buildwithclerk` and moved to the `clerk` GitHub org once five or more projects are live.
- **The landing is the city.** `/` is one viewport with no scroll: the explorable pixel-art city is the gallery. Every project is a building; entering one opens a side panel with the project. `/p/[slug]` stays as the full, indexable page and deep-link target (`/?at=slug` opens the panel in the city). Decided on 2026-10-19 after two gallery-first iterations felt generic.
- The site is project #0: it dogfoods Clerk (custom sign-in with Clerk Elements, anonymous → account, server-side XP and achievements, avatar in user metadata).
- English first, Spanish second. Site and READMEs fully bilingual (`/` and `/es`); product UIs English with Spanish where cheap; Godot and the CLI English only in v1.

## Monorepo

```
apps/web                 Next.js 16, Tailwind v4, next-intl, motion 12, Phaser 4
examples/<slug>/         Self-contained, clonable with degit; own Clerk app; own .env.example
examples/<slug>/project.mdx   Content for /p/[slug]: what it shows, key moments, run locally
packages/registry        Zod schema + entries; feeds gallery and city
packages/ui              Design tokens mirrored from clerk.com
docs/                    Catalog, design notes
```

- pnpm workspaces + Turborepo, Node ≥ 22, TypeScript strict, Biome for lint and format, Vitest, Playwright only in `apps/web`.
- Non-JS examples (Godot, Go, Python) live in `examples/` outside the pnpm workspace with a `Makefile`.
- CI: typecheck, lint and build for every touched `examples/*` and for `apps/web`.
- Commits are incremental: one per logical step.

## Hosting

| What | Where |
| --- | --- |
| Site | Vercel, `buildwithclerk.com` |
| Web demos | Vercel, `<slug>.buildwithclerk.com` |
| Go game server, Python API | Fly.io |
| Expo apps | EAS |
| Godot builds | GitHub Releases + web build on itch.io |

One Clerk workspace "Build with Clerk" with one production application per example. Every demo offers Google/GitHub and email code plus "Try as demo user", which signs the visitor in as a seeded user through a server-minted sign-in token (reset hourly). Demo users never earn city keys.

## Visual identity

Clerk's tokens as they are: Suisse Intl, Söhne Mono, purple `#6c47ff`, the gray ramp, multi-layer shadows, 0.5 px hairlines, `motion` 12 with ease-out-cubic and bounce-free springs, `prefers-reduced-motion` honoured. Gallery follows the system theme; the city is always dark.

`/`: the Phaser canvas fills the viewport. HUD pills in clerk.com's dark style: logo top-left; "All projects" (an accessible list that teleports you to a door), GitHub, language and sign-in top-right; keys counter and the contextual hint bottom-left; controls bottom-right. A visually hidden project list is server-rendered for crawlers and no-JS.

`/p/[slug]`: 15 s video or GIF with Live demo / Code buttons; "What it shows" with a link per Clerk feature to its doc; architecture SVG; 3–5 annotated "Key moments" snippets; "Run it locally" with `npx degit` and env vars; the pixel key if you own it.

Analytics: Vercel Analytics on the site only. Nothing in the examples.

## Milestones

| | Deliverable | Done when |
| --- | --- | --- |
| M1 | Monorepo, registry, site sign-in (#0), **city v0 as the landing** | `/` is the walkable city with every building, signs, side panel and `?at=` deep links; `/p/[slug]` in en and es; sign-in works; deployed |
| M2 | **Last Run** | Playable at `lastrun.buildwithclerk.com`, passkey claim, server-side replay check |
| M3 | **Keys** | `<ClerkKey />` in Last Run, redeem endpoint, XP and achievements persisted, anonymous cookie → account migration |
| M4 | **relay CLI** + minimal Relay | PKCE and device flow both work; `--json`; keychain; API key for CI |
| M5 | **Uptime Pages** | Two orgs with their own satellite domains, SAML against a test IdP, two plans |
| M6 | **Frequency** | Two plans, signed media URLs, `/tv` with device flow |
| M7 | **Couch Code** | Godot client authenticates via device flow, Go server verifies JWTs, M2M between services |
| M8 | **Till** | Cashier switch under 1 s, permission-gated refunds, offline charging |
| M9 | Music, SFX, city polish | Six tracks with crossfade, all SFX, particles, achievements, `/u/[username]` |
| Launch | | Six live projects plus the site |

Each project gets a short design interview right before its milestone starts. The non-negotiables are already fixed in the catalog.

## Contributions

v1 is closed. `CONTRIBUTING.md`, a PR template with the five "not a dummy" checks, and a "Propose a project" issue template exist from day one so the door opens right after launch.

## Cut from v1

Real-time ghosts of other visitors, Phaser building interiors, touch d-pad, avatar customization, day/night cycle, quests.
