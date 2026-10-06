import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import { join, resolve } from "path";

export default defineConfig({
  base: "/telechargement",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(join(__dirname, "assets")),
    },
  },
});
