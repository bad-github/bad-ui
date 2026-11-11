import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      // 工作区 demo 直接使用源码，保留组件热更新及应用自身的 Tailwind 类扫描。
      '@badnpm/ui': resolve(import.meta.dirname, '../../packages/ui/src'),
    },
  },
});
