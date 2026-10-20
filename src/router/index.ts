import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../pages/index.vue"),
    },
    {
      path: "/gallery",
      name: "gallery",
      component: () => import("../pages/gallery.vue"),
    },
    {
      path: "/animelist",
      name: "animelist",
      component: () => import("../pages/animelist.vue"),
    },
    {
      path: "/bingo",
      name: "bingo",
      component: () => import("../pages/bingo.vue"),
    },
    // Sin página 404 propia: redirigir al inicio (antes, página de error de Nuxt).
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      redirect: "/",
    },
  ],
});

export default router;
