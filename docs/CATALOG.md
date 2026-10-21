# Catalog

Fifteen products, each led by one Clerk feature. ★ marks the v1 set. Every entry must pass the five checks in [CONTRIBUTING.md](../CONTRIBUTING.md) before it ships.

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
