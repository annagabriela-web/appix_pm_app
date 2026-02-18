import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  vite: {
    resolve: {
      alias: {
        "@components": "/src/components",
        "@hooks": "/src/hooks",
        "@types": "/src/types",
        "@services": "/src/services",
        "@styles": "/src/styles",
      },
    },
  },
});
