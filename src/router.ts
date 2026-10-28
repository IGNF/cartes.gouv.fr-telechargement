import { createRouter, createWebHistory } from "vue-router";
import { createAuthGuard } from "authentification-vue-oidc";
import DownloadView from "./views/DownloadView.vue";
import HomeView from "./views/HomeView.vue";

export function createAppRouter() {
  const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Réserver ce chemin avant /:downloadUrl : il ne désigne pas un produit.
    {
      path: "/login",
      name: "auth-callback",
      component: HomeView,
      meta: { isAuthCallback: true },
    },
    // page d'accueil (edito)
    {
      path: "/",
      name: 'telechargement',
      alias: "/telechargement",
      component: HomeView
    },
    // page telechargement d'une donnee
    {
      path: "/:downloadUrl",
      component: DownloadView,
      props: true
    },
  ],
  });
  router.beforeEach(createAuthGuard());
  return router;
}