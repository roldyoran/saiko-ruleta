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
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryView,
    },
    {
      path: '/animelist',
      name: 'animelist',
      component: AnimeListView,
    },
    {
      path: '/bingo',
      name: 'bingo',
      component: BingoView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: PageNotFoundView,
    },
  ],
})

export default router
