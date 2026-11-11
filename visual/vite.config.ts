import { defineConfig } from 'vitest/config';
export default defineConfig({ base: './', build: { outDir: 'dist', chunkSizeWarningLimit: 1800, rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } } }, test: { environment: 'node', maxWorkers: 1 } });
