# 迁移说明

通过 `animation` 选择主题切换效果，默认 `none`：

```tsx
<ThemeToggle animation="none" />
<ThemeToggle animation="circle" />
<ThemeToggle animation="dots" />
```

`circle` 从按钮中心圆形扩散；`dots` 用 Canvas 绘制点阵幕布，从按钮向外铺开，切换主题后再从按钮向外消散，约 1.04 秒。
设置了减少动态效果时直接切换；`circle` 在不支持 View Transition API 时也直接切换。
动画期间忽略重复切换，结束后自动清理遮罩。图标继续使用现有 SVG。
迁移时同时复制 `theme-animation.ts`，它依赖 `react-dom` 的 `flushSync`。

复制以下文件：

- `index.tsx`：继续使用项目已有的 Button 和主题切换函数。
- `icons.tsx`：独立 SVG React 图标，不依赖 Lucide。
- `theme-toggle.css`：图标显隐、动画、尺寸和无障碍文字的原生 CSS，不依赖 Tailwind。

迁移后调整 `Button` 与 `useTheme` 的导入以接入目标项目，并显式引入 CSS：

```tsx
import './theme-toggle/theme-toggle.css';
```

`useConfig` 用于读取本组件库的默认文案和禁用状态。独立迁移时，可删除这个导入，将 `config.locale.themeToggle` 替换为目标项目的默认文案、`config.disabled` 替换为 `false`；图标和 CSS 无需修改。

CSS 根据祖先的 `.dark` 类切换图标与无障碍文案。目标项目的 Button 外观由其自身样式负责；无需复制本仓库的 Tailwind 图标工具类或安装 Lucide。

本仓库通过 `styles/component.css` 统一引入样式，JS 文件不重复导入 CSS。
`theme-toggle-backup.tsx` 保留改造前的 Button + Tailwind + Lucide 实现。
