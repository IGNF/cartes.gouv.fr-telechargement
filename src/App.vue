<script setup lang="ts">
import { RouterView } from "vue-router";
import {
  CgfrFooter,
  CgfrHeader,
  CgfrModalCookies,
  CgfrModalTheme,
} from "cartes.gouv.fr-vue-components";
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
  <CgfrFooter base-url="https://cartes.gouv.fr" />
  <CgfrModalCookies />
  <CgfrModalTheme />
</template>