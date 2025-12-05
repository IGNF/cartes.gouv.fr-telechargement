import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

import { join, resolve } from "path";

export default defineConfig({
  base: "/telechargement/",
  plugins: [TanStackRouterVite({}), react()],
  resolve: {
    alias: {
      "@": resolve(join(__dirname, "assets")),

      "ign-dsfr-header/dist/ign-dsfr-header.js": resolve(
        join(
          __dirname,
          "node_modules",
          "ign-dsfr-header",
          "dist",
          "ign-dsfr-header.js"
        )
      ),
    },
  },
});
