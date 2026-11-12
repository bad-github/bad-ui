// Storybook 按配置目录中的固定入口名 main 读取此文件，在 Node.js 中加载。
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/postcss';
import { themeStorageKeys } from './theme/storage-keys';

const config: StorybookConfig = {
  // 使用 React 渲染器和 Vite 构建器，独立于组件库的 Rollup 发布构建。
  framework: '@storybook/react-vite',
  // 相对于 .storybook 目录查找独立文档和源码旁的 TS/TSX 示例。
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  // Docs 生成组件文档；a11y 提供浏览器中的无障碍检查面板。
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest'
  ],
  // 仅注入共享存储键对象，主题恢复逻辑保留在 preview-head.html 中。
  // 必须放在 head 前面，使 HTML 脚本执行时已经能读取到这个对象。
  previewHead(head) {
    const keys = JSON.stringify(themeStorageKeys).replace(/</g, '\\u003c');
    return `<script>window.__STORYBOOK_THEME_STORAGE_KEYS__ = ${keys};</script>${head ?? ''}`;
  },
  // 在 Storybook 默认 Vite 配置上追加项目配置，保留其内置插件。
  async viteFinal(config) {
    return mergeConfig(config, {
      // Rollup 的 PostCSS 配置会复制字体；Vite 需要自行处理资源 URL。
      css: {
        postcss: {
          // base 指定 Tailwind 类名扫描基目录；字体资源 URL 由 Vite 处理。
          plugins: [tailwindcss({ base: fileURLToPath(new URL('../src', import.meta.url)) })],
        },
      },
      resolve: {
        // 将包名及其子路径映射到源码，支持热更新且无需预先生成 dist。
        alias: { '@badnpm/ui': fileURLToPath(new URL('../src', import.meta.url)) },
      },
    });
  },
};

export default config;
