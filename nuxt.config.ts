// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  imports: {
    autoImport: false,
  },
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/scripts',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'dark'
  },
  css: ['./app/assets/css/main.css'],

  // Configuración global de metadatos
  app: {
    head: {
      htmlAttrs: {
        lang: 'es'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Saiko Ruleta',
      meta: [
        { name: 'description', content: 'Aplicación de ruleta interactiva, bingo y más juegos divertidos para streamers y comunidades.' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'msapplication-TileColor', content: '#e11d48' },
        { name: 'theme-color', content: '#e11d48' }
      ],
      link: [
        // Preload imágenes críticas de la ruleta
        { rel: 'preload', href: '/reigen_ag/Tania1_navidad.webp', as: 'image' },
        { rel: 'preload', href: '/reigen_ag/Tania2_navidad.webp', as: 'image' },
        { rel: 'preload', href: '/reigen_ag/Tago_ruleta_navidad.webp', as: 'image' },
        // Favicons
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  },

  // Configuración de build optimizada
  nitro: {
    compressPublicAssets: true,
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar el carousel en su propio chunk
            carousel: ['@/components/ImageCarousel.vue'],
          }
        }
      }
    }
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './app/components/ui'
  },
})