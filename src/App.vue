<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import {
  CgfrFooter,
  CgfrHeader,
  CgfrModalCookies,
  CgfrModalTheme,
} from "cartes.gouv.fr-vue-components";

const route = useRoute();
</script>

<template>
  <CgfrHeader
    badge-text="Rechercher"
    badge-icon="fr-icon-search-fill"
    badge-color="blue-cumulus"
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