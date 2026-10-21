# Build with Clerk

Una galería de productos reales construidos con [Clerk](https://clerk.com). Cada uno es un ejemplo completo y clonable que gira alrededor de una sola feature de Clerk. La galería es a su vez un pequeño juego: conduces la Clerk Van por un circuito 3D donde cada lugar es un proyecto y cada demo en vivo te entrega una llave.

**Sitio:** https://buildwithclerk.com (pronto)

## Qué hay aquí

```
apps/web            El sitio y el circuito (Next.js 16, Three.js)
examples/<slug>     Un producto autocontenido por carpeta, clonable por separado
packages/registry   Metadata tipada de cada proyecto; alimenta el circuito y las páginas
packages/ui         Tokens de diseño compartidos (paleta de Clerk, tipografía, motion)
docs/               Plan, catálogo, notas de diseño
```

Cada ejemplo tiene su propia aplicación de Clerk, su propio `.env.example` y un `project.mdx` que se convierte en su página del sitio. Clona uno con:

```sh
npx degit jibaru/buildwithclerk/examples/<slug> mi-app
```

## Proyectos

La lista completa está en [docs/CATALOG.md](docs/CATALOG.md) y el orden de entrega en [PLAN.md](PLAN.md).

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md). Todo proyecto debe pasar los cinco criterios "no dummy" del PR template.
