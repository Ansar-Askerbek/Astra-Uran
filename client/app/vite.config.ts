import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Здесь мы говорим: "Когда видишь @, иди в папку src"
      "@": path.resolve(__dirname, "./src"),
    },
  },
})