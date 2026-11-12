import { themes } from 'storybook/theming';

// 浅深色主题共用品牌设置，切换外围主题时仍保留包名。
// 默认品牌是一整张 SVG（包含图标和文字）；brandTitle 会将其整体替换。
// 使用固定 HTML 保留原书签图标，并用继承主题颜色的粗体文字显示包名。
const branding = {
  brandTitle: `
    <span style="display:inline-flex;align-items:center;gap:6px;height:22px">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="18" height="22" aria-hidden="true" focusable="false" style="display:block;flex-shrink:0">
        <path fill="#FF4785" d="M1.2 36.9L0 3.9c0-1.1.8-2 1.9-2.1l28-1.8a2 2 0 0 1 2.2 1.9 2 2 0 0 1 0 .1v36a2 2 0 0 1-2 2 2 2 0 0 1-.1 0L3.2 38.8a2 2 0 0 1-2-2z"/>
        <path fill="#FFF" d="M23.7 5L24 .2l3.9-.3.1 4.8a.3.3 0 0 1-.5.2L26 3.8l-1.7 1.4a.3.3 0 0 1-.5-.3zm-5 10c0 .9 5.3.5 6 0 0-5.4-2.8-8.2-8-8.2-5.3 0-8.2 2.8-8.2 7.1 0 7.4 10 7.6 10 11.6 0 1.2-.5 1.9-1.8 1.9-1.6 0-2.2-.9-2.1-3.6 0-.6-6.1-.8-6.3 0-.5 6.7 3.7 8.6 8.5 8.6 4.6 0 8.3-2.5 8.3-7 0-7.9-10.2-7.7-10.2-11.6 0-1.6 1.2-1.8 2-1.8.6 0 2 0 1.9 3z"/>
      </svg>
      <span style="font-family:inherit;font-size:18px;font-weight:700;line-height:22px;color:inherit;white-space:nowrap">UI Storybook</span>
    </span>`,
};

// 外层 loading 使用 appPreviewBg，不受预览 iframe 内的样式影响。
// 直接使用默认 Neutral 基础色的最终背景值，无需向 manager 注入 CSS 变量。
// 对应 src/styles/base-color/neutral.css 的 --background；调整基础色时需同步这里。
export const managerThemes = {
  light: { ...themes.light, ...branding, appPreviewBg: 'oklch(1 0 0)' },
  dark: { ...themes.dark, ...branding, appPreviewBg: 'oklch(0.145 0 0)' },
};
