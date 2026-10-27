<script setup lang="ts">
import { computed } from "vue";
import { useAuth } from "authentification-vue-oidc";
import { RouterView, useRoute } from "vue-router";
import {
  CgfrFooter,
  CgfrHeader,
  CgfrModalCookies,
  CgfrModalTheme,
} from "@ignf/cartes.gouv.fr-vue-components";

const route = useRoute();
const { isAuthenticated, user: authUser, login, logout, error, status } = useAuth();
const user = computed(() => ({
  first_name: String(authUser.value?.claims.given_name || authUser.value?.name || ""),
  last_name: String(authUser.value?.claims.family_name || ""),
  email: authUser.value?.email || "",
}));

async function onLogin() {
  try {
    // createAuthGuard attend un chemin relatif à la base du routeur, pas une URL préfixée.
    await login({ returnTo: route.name === "auth-callback" ? "/" : route.fullPath });
  } catch {
    // Le composable expose l’erreur affichée ci-dessous.
  }
}

async function onLogout() {
  try {
    await logout();
  } catch {
    // Le composable expose l’erreur affichée ci-dessous.
  }
}
</script>

<template>
  <CgfrHeader
    badge-text="Rechercher"
    badge-icon="fr-icon-search-fill"
    badge-color="blue-cumulus"
    :authenticated="isAuthenticated"
    :user="user"
    @login="onLogin"
    @logout="onLogout"
  />
  <main class="fr-container--fluid">
    <RouterView />
  </main>
  <CgfrFooter
    base-url="https://cartes.gouv.fr"
    :compact="route.name !== 'telechargement'"
  />
  <CgfrModalCookies />
  <CgfrModalTheme />
</template>