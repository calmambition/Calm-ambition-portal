import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// On GitHub Pages the site is served from /Calm-ambition-portal/.
// Locally (dev and preview) it is served from the root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Calm-ambition-portal/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "opengraph.jpg"],
      manifest: {
        name: "Calm Ambition",
        short_name: "Calm Ambition",
        description: "A quiet space to capture what presses on you between coaching sessions.",
        theme_color: "#FAF8F4",
        background_color: "#FAF8F4",
        display: "standalone",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // The app is localStorage-only; precaching the shell makes it
        // open and log offline once installed.
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: undefined,
      },
    }),
  ],
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
