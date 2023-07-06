import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { pluginAPI } from "vite-plugin-api";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    pluginAPI({
      entry: "src/server.js",
      mapping: {
       default: "use",
       GET: "get",
       POST: false,
       PUT: "put",
       PATCH: false,
       DELETE: "delete",
  // Overwrite
      }
    })
  ],
  
})
