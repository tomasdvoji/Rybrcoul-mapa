import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // relativní cesty – build funguje i v podadresáři webu (např. /mapa/)
  base: "./",
  plugins: [react(), tailwindcss()],
});
