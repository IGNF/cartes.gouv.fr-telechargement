<script setup lang="ts">
import { LoggerUtils } from "geopf-extensions-openlayers";

if (import.meta.env.PROD) {
  LoggerUtils.disableAll();
} else {
  LoggerUtils.enableAll();
}
</script>

<template>
  <slot />
</template>

<style>
#map .position-container-top-right {
  top: 1rem;
  right: 0.6rem;
  z-index: 2;
}

#map .position-container-top-right .gpf-panel {
  top: 0 !important;
  right: calc(100% + 0.75rem) !important;
  max-width: calc(100vw - 6rem);
}

#map .position-container-top-right .gpf-panel__content {
  overflow: auto;
  max-height: 60vh;
}

#map form[id^="GPimportForm-"] {
  margin-bottom: 0;
  overflow: hidden;
}

@media (max-width: 600px) {
  #map .position-container-top-right {
    top: 0.75rem;
    right: 0.75rem;
  }

  #map .position-container-top-right .gpf-panel {
    min-width: 0;
    max-width: calc(100vw - 6rem);
  }
}
</style>