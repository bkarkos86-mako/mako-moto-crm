import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/mako-moto-crm/',
  plugins: [react()],
});
