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
  
  // Preload de recursos críticos
  // app: {
  //   head: {
  //     link: [
  //       // Preload imágenes críticas de la ruleta
  //       { rel: 'preload', href: '/reigen_ag/Tania1_navidad.webp', as: 'image' },
  //       { rel: 'preload', href: '/reigen_ag/Tania2_navidad.webp', as: 'image' },
  //       { rel: 'preload', href: '/reigen_ag/Tago_ruleta_navidad.webp', as: 'image' },
  //     ]
  //   }
  // },

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