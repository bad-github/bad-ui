// Storybook 按配置目录中的固定入口名 manager 识别此文件，在浏览器外围界面中执行。
// 无需在 main.ts 或 preview.tsx 中手动导入此入口，新增后应重启 Storybook。
import { addons } from 'storybook/manager-api';
import { managerThemes } from './manager/theme-config';
import { readManagerTheme } from './manager/theme-storage';
import { registerManagerThemeTool } from './manager/theme-tool';

// 同时设置外围初始主题与外层 loading 背景。
const initialTheme = managerThemes[readManagerTheme()];

addons.setConfig({
  // 优先恢复已保存的外围主题；没有有效记录时默认深色。
  // 仅影响侧边栏、顶部工具栏、插件面板；组件预览仍由 ThemeProvider 管理。
  theme: initialTheme,
});

// 显式注册项目的外围主题工具；无需新增依赖或在 main.ts 的 addons 中登记。
registerManagerThemeTool();
