import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeRuletView.vue'
import GalleryView from '@/views/GalleryView.vue'
import AnimeListView from '@/views/AnimeListView.vue'
import BingoView from '@/views/BingoView.vue'
import PageNotFoundView from '@/views/PageNotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Ruleta-Home' },
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryView,
      meta: { title: 'Galería' },
    },
    {
      path: '/animelist',
      name: 'animelist',
      component: AnimeListView,
      meta: { title: 'Lista de Anime' },
    },
    {
      path: '/bingo',
      name: 'bingo',
      component: BingoView,
      meta: { title: 'Bingo' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: PageNotFoundView,
      meta: { title: 'Página no encontrada' },
    },
  ],
})

export default router
