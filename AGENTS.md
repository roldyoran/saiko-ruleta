<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Saiko Ruleta — notas del repo

SPA Vue 3 + vue-router + Tailwind 4, sin SSR ni backend. Toolchain Vite+ 1.3.0
(global `vp` + `vite-plus` local), pnpm 11, Node `^22.18.0 || ^24.11.0 || >=26`.

## Comandos

- `vp install`, `vp dev`, `vp check`, `vp build`, `vp preview`. Sin CLI global:
  `pnpm exec vp <comando>`.
- Los scripts `dev`/`build`/`preview` de `package.json` llaman a los built-ins
  (`vp dev`, …); no hay scripts propios que validar con `vp run`.
- `vp test` no tiene suites: no hay `*.test.*` en el repo.
- El hook pre-commit corre `vp staged` (`vp check --fix` sobre staged). En Windows,
  un commit gigante puede romperlo por límite de línea de comandos; si `vp check`
  ya está en verde, commitea con `--no-verify`.

## Estructura

- `index.html` (head global + clase `dark` anti-FOUC), `src/main.ts`
  (app + router + head + css), `src/router/index.ts` (único lugar de rutas).
- `src/pages/`: 4 vistas (`index`, `bingo`, `gallery`, `animelist`). Rutas
  desconocidas redirigen a `/` (route `not-found`, la usa el filtro de `SheetMenu`).
- `src/components/ui/`: shadcn-vue sobre `reka-ui` (requiere `@vueuse/core`).
- `src/composables/useAppMeta.ts`: SEO/OG por página. `src/lib/seo-config.ts`:
  dominio y defaults. `src/scripts/speech.js`: voz con annyang, lazy.
- Assets fijos en `public/` (`audios/`, `carousel/`, `reigen_ag/`, …).

## Quirks verificados

- Alias `@` → `src`: definido en `vite.config.ts` (`resolve.alias`) y en
  `tsconfig.json` (`paths` con `./`, sin `baseUrl`: tsgolint lo rechaza).
- Tipos `vite/client` llegan vía `/// <reference types="vite/client" />` en
  `env.d.ts` + devDep `vite: catalog:` (sin él no resuelven: no hay `vite`
  top-level, solo el alias al core).
- Head: `@unhead/vue` v3 → `createHead` se importa de `@unhead/vue/client`
  (no del entry raíz); `useHead` sí viene de `@unhead/vue`.
- App solo-modo-oscuro: la clase `dark` se fija en `index.html`, no hay toggle.
- Audios siempre con ruta absoluta (`/audios/...`): con history-mode las
  relativas se rompen fuera de `/`.
- `speech.js` habla con `index.vue` solo por `CustomEvent` en `window`
  (`ruleta-spin`, `ruleta-update-options`, `ruleta-play-audio`); no tocar el
  contrato sin actualizar ambos lados.
- `bingo.vue` comparte tableros por query `?bingo=` con APIs nativas
  (`window.location`/`history`); `animelist.vue` sincroniza filtros con
  `router.replace({ query })`.
