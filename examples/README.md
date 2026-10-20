# examples/

One folder per product. Each folder is a complete, standalone app that can be cloned on its own:

```sh
npx degit jibaru/buildwithclerk/examples/<slug> my-app
```

Rules every example follows:

- Its own Clerk application. Never share keys between examples.
- `.env.example` listing every variable, with a comment on where to get it.
- `README.md` (English) and `README.es.md` (Spanish) that get a stranger to a running app in under ten minutes.
- `project.mdx` with the frontmatter the registry expects: this becomes the project's page on the site.
- A real backend that verifies Clerk tokens. No client-only auth.
- Under ~2k lines of application code. If it grows past that, it is two examples.

JS/TS examples have a `package.json` and are part of the pnpm workspace. Godot, Go and Python examples have a `Makefile` with `make dev` and `make test` and are not part of the workspace.
