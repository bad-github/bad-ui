# 迁移说明

复制以下文件：

- `index.tsx`：继续使用项目已有的 Button 和主题切换函数。
- `icons.tsx`：独立 SVG React 图标，不依赖 Lucide。
- `theme-toggle.css`：图标显隐、动画、尺寸和无障碍文字的原生 CSS，不依赖 Tailwind。

迁移后调整 `Button` 与 `useTheme` 的导入以接入目标项目，并显式引入 CSS：

```tsx
import './theme-toggle/theme-toggle.css';
```

CSS 根据祖先的 `.dark` 类切换图标与无障碍文案。目标项目的 Button 外观由其自身样式负责；无需复制本仓库的 Tailwind 图标工具类或安装 Lucide。

本仓库通过 `styles/component.css` 统一引入样式，JS 文件不重复导入 CSS。
`theme-toggle-backup.tsx` 保留改造前的 Button + Tailwind + Lucide 实现。
