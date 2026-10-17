import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  publicDir: false,
  logLevel: 'error',
  build: {
    outDir: '/tmp/elike-video-build',
    emptyOutDir: true,
    lib: { entry: fileURLToPath(new URL('../src/lib/lithophane-scene.ts', import.meta.url)), formats: ['es'], fileName: () => 'scene.js' },
  },
})
