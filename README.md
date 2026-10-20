# Build with Clerk

A gallery of real products built with [Clerk](https://clerk.com), each one a complete, clonable example that leads with a single Clerk feature. The gallery itself is a small game: an explorable pixel-art city where every building is a project and every live demo hands you a key.

**Site:** https://buildwithclerk.com (soon)

## What lives here

```
apps/web            The gallery site and the city (Next.js 16, Phaser 4)
examples/<slug>     One self-contained product per folder, clonable on its own
packages/registry   Typed metadata for every project; feeds the gallery and the city
packages/ui         Shared design tokens (Clerk's palette, type scale, motion)
docs/               Plan, catalog, design notes
```

Every example has its own Clerk application, its own `.env.example`, and a `project.mdx` that becomes its page on the site. Clone one with:

```sh
npx degit jibaru/buildwithclerk/examples/<slug> my-app
```

## Projects

See [docs/CATALOG.md](docs/CATALOG.md) for the full list and [PLAN.md](PLAN.md) for what ships when.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Every project must pass the five "not a dummy" checks in the PR template.

## Languages

English first, Spanish second. The site and READMEs are fully bilingual; product UIs are English with Spanish where it is cheap.

---

Lee esto en español: [README.es.md](README.es.md)
