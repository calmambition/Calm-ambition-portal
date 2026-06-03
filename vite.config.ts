import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// On GitHub Pages the site is served from /Calm-ambition-portal/.
// Locally (dev and preview) it is served from the root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Calm-ambition-portal/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 22510,
  },
}));
