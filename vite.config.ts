import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger";

// Dynamic CSP plugin
const dynamicCSPPlugin = (mode: string) => ({
  name: 'dynamic-csp',
  transformIndexHtml(html: string) {
    // Define allowed connections based on environment
    const connectSrc = mode === 'production' 
      ? "'self' https://engine.labdojo.io https://cdn.jsdelivr.net https://api.github.com wss: ws:"
      : "'self' http://localhost:* https://cdn.jsdelivr.net https://api.github.com wss: ws:";
    
    const cspContent = `default-src 'self'; 
                        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; 
                        worker-src blob: 'self'; 
                        connect-src ${connectSrc}; 
                        img-src 'self' data: https: blob:; 
                        style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net blob: data:; 
                        font-src 'self' data: https://cdn.jsdelivr.net blob:; 
                        media-src 'self' blob:;`;

    return html.replace(
      'DYNAMIC_CSP_PLACEHOLDER',
      cspContent.replace(/\s+/g, ' ').trim()
    );
  }
});

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    dynamicCSPPlugin(mode),
  ].filter(Boolean),
  base: '/', // Use root path for custom domain
  server: {
    host: "::",
    port: 8080
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
}))