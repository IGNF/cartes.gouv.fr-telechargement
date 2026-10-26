<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import OpenLayersMap from "../components/OpenLayersMap.vue";
import DownloadPanel from "../components/DownloadPanel.vue";

const route = useRoute();
const downloadUrl = computed(() => String(route.params.downloadUrl ?? ""));
</script>

<template>
  <div class="fr-grid-row h-83vh">
    <OpenLayersMap :download-url="downloadUrl" />
    <aside class="fr-col-4 fr-p-3w"><DownloadPanel :download-url="downloadUrl" /></aside>
  </div>
</template>

<style>
.h-83vh {
  height: 83vh;
}
</style>