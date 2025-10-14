import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { federation } from "@module-federation/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3001,
    cors: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    federation({
      name: "lovableunicornpanel",
      filename: "remoteModules.js",
      manifest: true,
      exposes: {
        "./lovablehomemoduleComponents":
          "./src/modules/lovablehomemodule/index.ts",
        "./udhsellermoduleComponents": "./src/modules/udhsellermodule/index.ts",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "react-router-dom": { singleton: true },
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "ES2022",
    minify: false,
    cssCodeSplit: false,
  },
}));
