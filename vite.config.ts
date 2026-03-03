import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import generouted from "@generouted/react-router/plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), generouted()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // host: true,
    proxy: {
      "/api/v1": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    cors: true,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".ngrok-free.app", // Allows all ngrok subdomains
      "*.ngrok-free.app", // Alternative syntax for all subdomains
      "639c-103-165-225-210.ngrok-free.app", // Your specific ngrok URL
    ],
  },
});
