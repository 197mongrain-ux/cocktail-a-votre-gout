import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.VITE_BASE || "/cocktail-a-votre-gout/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/tip": { target: "http://127.0.0.1:8787", changeOrigin: true },
      "/tip-jar": { target: "http://127.0.0.1:8787", changeOrigin: true },
      "/health": { target: "http://127.0.0.1:8787", changeOrigin: true },
    },
  },
});
