import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import packageJson from "./package.json";

const frontendBuildTime = new Date().toISOString();

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
    "import.meta.env.VITE_APP_BUILD_TIME": JSON.stringify(frontendBuildTime),
  },
  server: {
    proxy: {
      "/api": {
        //target: "http://192.168.178.63:8081",
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
