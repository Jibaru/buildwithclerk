# Catalog

Twenty-eight products, each led by one Clerk feature. Projects 1–15 are built inside this monorepo; 16–28 are products from the [Jibaru](https://github.com/Jibaru), [crafter-station](https://github.com/crafter-station) and [crafter-games](https://github.com/crafter-games) repositories that already ship with Clerk. ★ marks the v1 set. Every entry must pass the five checks in [CONTRIBUTING.md](../CONTRIBUTING.md) before it ships.

| # | District | Project | What it is | Hero Clerk feature | Stack | Status |
|---|---|---|---|---|---|---|
| 0 ★ | Plaza | **Build with Clerk** (`apps/web`) | The site: drive the Clerk Van to every project, with a player profile | Custom sign-in on Clerk Core 3 hooks, anonymous → account, server-side achievements, user metadata | Next.js 16, Three.js | v1 |
| 1 ★ | Arcade | **Last Run** | Browser roguelike. Play anonymously, die, "claim this run" with a passkey and your score enters the leaderboard. The server replays the input log before accepting a score | Passkeys, anonymous → user upgrade, backend verification | Phaser 4, Hono | v1 |
| 2 ★ | Arcade | **Couch Code** | Jackbox-style party game for TV/desktop: the screen shows a code, you approve from your phone, your avatar appears. Players guess the output of code snippets. Go game server verifies JWTs on the WebSocket; matchmaker ↔ room servers with M2M | Device Authorization Grant, Go SDK, M2M tokens | Godot 4, Go | v1 |
| 3 | Arcade | **Postal Chess** | Async turn-based chess. The challenge link is an invitation that creates the friend's account | Expo SDK, native Apple/Google, invitations, push to the right user | Expo | backlog |
| 4 ★ | Downtown | **Uptime Pages** | Multi-tenant status pages: every org gets a custom domain, admin/responder/viewer roles, SAML per org, a plan per org | Organizations, custom roles, SAML, Billing B2B, satellite domains | Next.js, Postgres | v1 |
| 5 | Terminal | **Relay** | Webhook relay as a product: API keys for customers, OAuth provider for third parties, MCP server | API Keys, M2M, Clerk as OAuth IdP, MCP | Next.js, Hono | v1 (minimal, with the CLI) |
| 6 ★ | Market | **Till** | Tablet point of sale: the store is an org, cashiers switch in under a second, only managers refund, keeps charging with the network down | Multi-session, permissions, PIN/passkey step-up | Expo (iPad) or PWA | v1 (first to cut) |
| 7 ★ | Broadcast | **Frequency** | Podcast and video platform with free and paid tiers, media URLs signed only with a valid session, and "sign in on your TV" with a 10-foot UI | Billing B2C, `has({ plan })`, device flow for TV | Next.js, Python API | v1 |
| 8 | Broadcast | **Margin** | Embeddable comments widget for any site | Satellite domains, Clerk inside a third-party iframe | React, Hono | backlog |
| 9 ★ | Terminal | **relay CLI** | Relay's CLI: PKCE with localhost callback, device flow fallback over SSH/CI, OS keychain, `--json` everywhere, org switching, API keys for CI | OAuth PKCE, device flow, machine tokens | Node/Bun | v1 |
| 10 | Terminal | **Snips** (VS Code) | Team snippets synced per org, auth from inside the editor | Device flow in VS Code, orgs | VS Code API | backlog |
| 11 | Terminal | **Clip** (Chrome) | Read-later extension that shares its session with the web app | Chrome extension SDK, sync host | Plasmo | backlog |
| 12 | Terminal | **Linker** (Discord) | `/link` connects your account; Discord roles mirror org roles | Clerk as OAuth provider, webhooks | Discord.js | backlog |
| 13 | Terminal | **Concierge** | An agent that calls Relay's API on your behalf with scoped tokens and a consent screen | OAuth scopes, consent, MCP, agent tooling | Vercel AI SDK | backlog |
| 14 | Downtown | **Vault** | Wallet: sending money requires reverification plus a passkey; device management and "sign out everywhere" | Reverification (step-up), passkeys, Sessions API | Next.js | backlog |
| 15 | Downtown | **Exodus** | Zero-downtime migration from NextAuth/Auth0 with lazy password-hash import | Backend API import, dual-run | Next.js | backlog |

## Products from the Jibaru, crafter-station and crafter-games repositories

Found on 2026-11-23 by scanning 477 repositories (68 depend on Clerk) and reading which Clerk APIs each one calls. These are real products with users; the gallery links to them and does not vendor their code. Repos marked *private* keep their demo public and hide the code button.

| # | District | Project | What it is | Hero Clerk feature | Stack | Repo |
|---|---|---|---|---|---|---|
| 16 | Terminal | **Petdex** | Public gallery of animated pets for coding agents, 4k+ stars. CLI and three native desktop apps sign in through Clerk's OAuth endpoints with PKCE | Clerk as OAuth provider, reverification, user metadata | Next.js, Bun, Swift, Rust, Zig | [crafter-station/petdex](https://github.com/crafter-station/petdex) |
| 17 | Downtown | **Humans** | Protected directory of people in LATAM who build with code | Clerk API Keys (`acceptsToken: "api_key"`), organizations, webhooks, sessions API, @clerk/testing | Next.js, Hono, Bun, Postgres | [crafter-station/humans](https://github.com/crafter-station/humans) |
| 18 | Plaza | **Crafter Station** | The community site, its API and `@crafter/cli` | OAuth PKCE from a CLI, API accepting `oauth_token` or `session_token`, reverification, webhooks, five locales | Next.js, Hono, Bun | [crafter-station/crafter.run](https://github.com/crafter-station/crafter.run) |
| 19 | Terminal | **Blaze** | Any database in 200 ms: REST, MCP server and dashboard | MCP server protected with @clerk/mcp-tools, Waitlist, @clerk/testing | Next.js, Bun, Dokploy | [crafter-station/blaze](https://github.com/crafter-station/blaze) |
| 20 | Market | **Makeables** | Cards, badges and stickers from a prompt or a photo | Device Authorization Grant in the CLI, Billing with `has({ plan })` and `<Protect>`, organizations | Next.js, Bun | crafter-station/makeables *(private)* |
| 21 | Arcade | **Clerk Anywhere** | Clerk sign-in on retro consoles. GBA works offline with a challenge-response code; PSP, 3DS, Wii and DS planned with device flow | Device flow, backend verification | C, devkitARM, Next.js | [Jibaru/clerk-anywhere](https://github.com/Jibaru/clerk-anywhere) |
| 22 | Arcade | **Clerk Van Run** | One-lap time trial in the Clerk Van with a public leaderboard | Passkeys, custom sign-in on Core 3 hooks | Next.js, Three.js, Postgres | [Jibaru/clerkgame](https://github.com/Jibaru/clerkgame) |
| 23 | Broadcast | **C3.chat** | One chat for every AI model, web and mobile | Expo SDK with secure token cache, custom flows | Next.js, Expo | [crafter-station/cs.chat](https://github.com/crafter-station/cs.chat) |
| 24 | Terminal | **uploadx** | Self-hosted UploadThing clone over MinIO | Device flow in the CLI, dashboard API accepting OAuth tokens, organizations | Next.js, MinIO, Postgres | [crafter-station/uploadx](https://github.com/crafter-station/uploadx) |
| 25 | Downtown | **Crafter CRM** | CLI-first CRM for sponsors, judges and mentors, with an MCP server on the same API | MCP with @clerk/mcp-tools, browser PKCE or `--device` login, organizations | Next.js, Bun, Postgres | crafter-station/crm *(private)* |
| 26 | Downtown | **Elements** | shadcn/ui blocks for auth, payments and more, 500+ stars | Custom sign-in and sign-up on Clerk hooks, waitlist, organizations | Next.js, shadcn/ui | [crafter-station/elements](https://github.com/crafter-station/elements) |
| 27 | Broadcast | **Maca** | Voice-to-text for macOS with a web account | Webhooks mirroring users to Postgres, backend verification from an Electron app | Electron, Next.js | crafter-station/maca *(private)* |
| 28 | Terminal | **LaTeX API** | Cloud LaTeX compilation over HTTP | Clerk session on the dashboard mints the API keys; a counterpoint to Clerk API Keys | Next.js, Hono, Postgres, Docker | [Jibaru/latex-api](https://github.com/Jibaru/latex-api) |

Siblings seen in the same scan, not listed as places: badge-studio (same device-flow CLI as makeables), sponsors (MCP + CLI, predecessor of the CRM), maca-int (Expo client of Maca), crafter-code (Tauri desktop), o1 (Go, `clerk-sdk-go`, API keys), css-bash-vote (`@clerk/astro`), inloop (organizations), learnaws and learnclaudecode (Waitlist, es-MX localization). Repos that only use `clerkMiddleware` and the prebuilt components (hack0, build4latam, text0, pawboard, sql4all, meet.up, githunter, wapi, latex0) fail check 2 below and stay out.

## Non-negotiables for the v1 set

Fixed in the design interview. Everything else about each project is decided just before building it.

- **Last Run**: deterministic ~60 s runs from a seed; the server replays the input log before accepting a score; playable without an account; passkey is the primary method at "claim".
- **Couch Code**: the TV/desktop (Godot) authenticates with the device flow and shows the code on screen; players join from a minimal phone web app; the Go game server verifies the Clerk JWT on the WebSocket handshake; matchmaker ↔ room servers with M2M.
- **Uptime Pages**: orgs with custom roles; a satellite domain per org (`status.customer.com` via CNAME); SAML against a test IdP; Billing B2B with two plans gated with `has()`.
- **Frequency**: Billing B2C with two plans; media URLs signed by the Python backend only with a valid session; TV mode at `/tv` with the device flow; CC-licensed content.
- **relay CLI + Relay**: PKCE with localhost callback; device flow when there is no browser; token in the OS keychain; `--json` on every command; active-org switching; API keys for CI. Relay minimum: create endpoint, list deliveries, replay one.
- **Till**: multi-session with cashier switch under 1 s; refunds only with `org:refunds:manage`; charging works with the network down.

## Criteria: "not a dummy"

1. A real domain with a real auth problem that Clerk solves better than hand-rolling.
2. One hero Clerk feature in the title, never "uses Clerk".
3. A public demo anyone can try in under 60 seconds without creating anything ("Try as demo user" via a server-minted sign-in token).
4. Understandable in an afternoon: roughly 2k lines of application code or fewer.
5. A real backend that verifies tokens. No client-only auth.
