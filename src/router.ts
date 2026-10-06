import { createRouter, createWebHistory } from "vue-router";
import DownloadView from "./views/DownloadView.vue";
import HomeView from "./views/HomeView.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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