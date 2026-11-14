import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    // 覆盖率属于整个 Vitest 运行，应与 projects 平级，不放进单个测试项目。
    // 仅在命令带 --coverage 时启用，普通测试仍使用原来的运行方式。
    coverage: {
      // 已安装的 @vitest/coverage-v8 通过 Chromium 的 V8 引擎收集执行信息。
      provider: 'v8',
      // 将未被测试导入的源码也纳入分母，避免只统计已经执行过的文件。
      include: ['src/**/*.{ts,tsx}'],
      // 排除示例、类型声明和纯转发入口，关注实际组件与逻辑实现。
      exclude: ['src/**/*.stories.{ts,tsx}', 'src/**/*.d.ts', 'src/**/index.ts'],
      // text 在终端显示摘要，html 生成可逐文件查看未覆盖代码的网页。
      reporter: ['text', 'html'],
      // 相对于 UI 包根目录；这是生成目录，默认会在下次采集时清理。
      reportsDirectory: './coverage',
    },
    projects: [
      {
        extends: true,
        // 提前预构建已出现延迟发现的依赖，避免首次加载 Story 时刷新测试页面。
        optimizeDeps: {
          include: ['@base-ui/react/switch', 'input-otp', '@base-ui/react/menubar', '@shadcn/react/message-scroller', '@base-ui/react/navigation-menu', '@base-ui/react/progress', '@shadcn/react/questionnaire', '@base-ui/react/radio', '@base-ui/react/radio-group', 'react-resizable-panels', '@base-ui/react/scroll-area', '@base-ui/react/select', '@base-ui/react/slider', '@base-ui/react/tabs', '@base-ui/react/toast', '@base-ui/react/toggle', '@base-ui/react/toggle-group'],
        },
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
