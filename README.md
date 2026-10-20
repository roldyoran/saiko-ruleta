# Saiko Ruleta

Aplicación de ruleta interactiva, bingo y más juegos divertidos para streamers y comunidades.
Construida con Vue 3 + Vite + Tailwind CSS 4, gestionada con la toolchain Vite+ (`vp`).

## Requisitos

- Node.js `^22.18.0 || ^24.11.0 || >=26.0.0`
- pnpm 11 (gestionado por `vp`)
- CLI global `vp` 1.3.0 (opcional pero recomendado): `irm https://vite.plus/ps1 | iex`

## Desarrollo

```bash
vp install   # instalar dependencias
vp dev       # servidor de desarrollo (Vite)
vp check     # formato (Oxfmt), lint (Oxlint) y tipos
vp build     # build de producción → dist/
vp preview   # previsualizar la build
```

Sin el CLI global, usa el CLI local: `pnpm exec vp <comando>`.

> `vp dev` / `vp build` son comandos integrados de Vite+.
> `vp run dev` / `vp run build` ejecutarían los scripts `dev`/`build` de `package.json`.

## Rutas

| Ruta         | Vista                                       |
| ------------ | ------------------------------------------- |
| `/`          | Ruleta (`src/pages/index.vue`)              |
| `/bingo`     | Bingo (`src/pages/bingo.vue`)               |
| `/gallery`   | Galería (`src/pages/gallery.vue`)           |
| `/animelist` | Lista de animes (`src/pages/animelist.vue`) |

Las rutas se definen en `src/router/index.ts` (vue-router, lazy loading por ruta).
Rutas desconocidas redirigen a `/`.

## Estructura

```
src/
├── main.ts          # entrada: app + router + head + css + modo oscuro
├── App.vue          # layout raíz (RouterView + menú + Toaster)
├── router/          # definición de rutas
├── pages/           # vistas de las 4 rutas
├── components/      # ruleta, bingo, fondos, ui (shadcn-vue/reka-ui)
├── composables/     # useRouletteConfig, useAppMeta (SEO)
├── lib/             # seo-config, utils
├── assets/          # css + galeria.json
└── scripts/         # speech.js (voz con annyang, lazy)
```

## Notas

- La app es 100 % cliente (SPA): sin SSR ni backend. Los audios e imágenes viven en `public/` y se referencian con rutas absolutas (`/audios/...`).
- Modo oscuro siempre activo: se aplica la clase `dark` en `index.html` antes del primer pintado.
- Metadatos SEO/OG por página con `@unhead/vue` (`src/composables/useAppMeta.ts`).
