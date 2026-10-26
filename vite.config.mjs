import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pagesBasePath = process.env.GITHUB_PAGES_BASE_PATH?.replace(/\/$/, "");

export default defineConfig({
  base: pagesBasePath ? `${pagesBasePath}/` : "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
