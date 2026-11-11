import { themes } from 'storybook/theming';

// 外层 loading 使用 appPreviewBg，不受预览 iframe 内的样式影响。
// 直接使用默认 Neutral 基础色的最终背景值，无需向 manager 注入 CSS 变量。
// 对应 src/styles/base-color/neutral.css 的 --background；调整基础色时需同步这里。
export const managerThemes = {
  light: { ...themes.light, appPreviewBg: 'oklch(1 0 0)' },
  dark: { ...themes.dark, appPreviewBg: 'oklch(0.145 0 0)' },
};
