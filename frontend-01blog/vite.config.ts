import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  build: {
    ssr: false // disable server-side rendering
  },
  server: {
    port: 4200
  }
});
