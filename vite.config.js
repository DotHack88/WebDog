import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import localUploadPlugin from './vite-plugin-local-upload.js'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1', // Forza IPv4 per evitare problemi con WebSocket/HMR
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    localUploadPlugin(),

    // ── Ottimizzazione automatica immagini al build ──────────────
    // Comprime JPG, PNG, WebP nella cartella /public e negli import
    // senza alterare i file originali (opera sul /dist).
    // Risultato atteso: -50/70% sul peso delle PNG, -30/40% sui JPG.
    ViteImageOptimizer({
      // JPG / JPEG — qualità 82, progressive rendering
      jpg: {
        quality: 82,
        progressive: true,
      },
      jpeg: {
        quality: 82,
        progressive: true,
      },
      // PNG — qualità 80-90, palette ottimizzata
      png: {
        quality: 85,
      },
      // WebP — qualità 80 (già ottimizzata di default)
      webp: {
        quality: 80,
        lossless: false,
      },
      // Converti automaticamente PNG/JPG in WebP nel dist
      // (mantiene anche il file originale come fallback)
      includePublic: true,   // processa anche /public
      logStats: true,        // stampa le dimensioni prima/dopo nel log di build
    }),
  ],
})
