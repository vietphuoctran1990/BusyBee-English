import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin: emit version.json with build timestamp on every build
const generateVersionPlugin = (): Plugin => ({
  name: 'generate-version',
  generateBundle() {
    const buildTime = new Date().toISOString();
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ buildTime }),
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const buildTime = new Date().toISOString();
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), generateVersionPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      '__BUILD_TIME__': JSON.stringify(buildTime),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'genai-vendor': ['@google/genai'],
            'icons-vendor': ['@heroicons/react'],
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});
