# UI components

React 19 组件库，提供 ESM、CommonJS、UMD 三种产物，以及独立的预编译 CSS。

## 安装

包发布后，在应用中安装组件库及 React 依赖：

```sh
npm install @badnpm/ui react@^19 react-dom@^19
```

组件包公开发布到 npm；发布前可使用本地 tarball 验证。下文统一使用当前包名 `@badnpm/ui`。

## 样式入口

三种 JS 格式共用 `dist/styles`，JS 入口不会自动加载 CSS。

| 样式入口                           | 用途                                        | 引入方式                     |
| ---------------------------------- | ------------------------------------------- | ---------------------------- |
| `@badnpm/ui/styles/index.css`      | Tailwind 重置、组件工具类、主题和基础色变量 | 使用内置组件样式时引入       |
| `@badnpm/ui/styles/custom.css`     | 页面主题配色和滚动条样式                    | 按需引入，与默认样式配合使用 |
| `@badnpm/ui/styles/font/geist.css` | 加载 Geist 字体，并设置默认无衬线字体       | 按需引入                     |

仅引入默认样式即可使用组件。页面配色与滚动条作为一组可选样式，字体可以单独选择，字体文件随包提供。
主题和基础色已包含在默认样式中。`@badnpm/ui/globals.css` 是默认样式的兼容入口，使用示例统一采用 `styles/index.css`。

非 Tailwind 应用使用预编译入口，无需安装 Tailwind、shadcn、tw-animate-css 或 Geist 字体包。
应用自身使用 Tailwind v4 时，请改用下节的统一编译入口，避免加载两套工具类。

## Tailwind v4 应用接入

应用自身也使用 Tailwind v4 时，统一在应用 CSS 中引入：

```css
@import '@badnpm/ui/styles/tailwind.css';
/* 可选页面背景和滚动条。 */
@import '@badnpm/ui/styles/custom.css';
/* 可选 Geist 字体。 */
@import '@badnpm/ui/styles/font/geist.css';
```

此入口原样发布，内部加载 Tailwind、主题令牌、状态变体、动画和手写组件 CSS，**不加载预编译的 `styles/index.css`**。通过包内相对路径扫描发布的 ESM 组件代码；应用源码自动扫描，使用方无需再声明库的 `@source` 或重复主题映射。所需的第三方 CSS 扩展随包携带，无需额外安装 shadcn 或 tw-animate-css。应用需要自行安装 Tailwind v4，并配置对应的 Vite 或 PostCSS 插件。

请用此入口替代应用原有的 `@import 'tailwindcss'` 与库的 `styles/index.css` 导入，不必同时重复引入它们。页面背景和字体仍按需选择。不使用 Tailwind 的应用继续使用原有预编译入口。

库与应用共用一次 Tailwind 编译，生成一套工具类，避免两份独立编译的规则互相覆盖，例如侧栏的 `hidden md:flex` 与移动菜单的 `flex md:hidden`。

### 两种模式只能选一种

| 应用环境 | 样式入口 | 工具类编译方 |
| --- | --- | --- |
| 无 Tailwind | `styles/index.css` | 组件库构建时预编译 |
| Tailwind v4 | `styles/tailwind.css` | 应用统一编译库与应用 |

- Tailwind 应用删除 JS 中的 `styles/index.css` / `globals.css` 导入，在自己的全局 CSS 引入 `styles/tailwind.css`，再由 JS 或 Next.js 根布局加载该全局 CSS。
- 不要同时引入两个入口；`globals.css` 是预编译入口的别名，也不能混用。可选 custom、scrollbar、font 入口不包含另一套工具类，可以按需保留。
- 原有应用 `@theme` 定制放在库入口之后。深浅模式仍由 `.dark` 控制，配色由主题变量控制。
- 本方案不是命名隔离。双方共享 Tailwind 的主题、断点和工具类；不要移除库需要的令牌或修改自定义状态变体含义。支持 Tailwind v4，当前验证版本为 4.3.x；带全局 prefix 的应用需要额外适配，不属于当前接入约定。
- 自定义扫描根目录、禁用自动扫描或忽略源码时，应用仍需配置自己的扫描范围；库扫描路径由入口内置。
- 下文 ESM、CJS、UMD 示例采用无需 Tailwind 的预编译模式；Tailwind 应用将样式部分替换为本节方案。

### 本地验证

```sh
pnpm --filter @badnpm/ui build
pnpm --filter @badnpm/ui test-styles
```

测试会打包真实 npm tarball，在临时消费环境中编译 Tailwind 入口，并验证库和应用类名扫描、工具类单次生成、移动/桌面显示以及非 Tailwind 的预编译入口。浏览器检查需要已安装 Playwright Chromium。

## ESM

适用于支持 TSX 和 CSS 导入的应用构建工具。`import` 自动选择 `dist/esm/index.js`。
以下示例作为浏览器入口使用，HTML 中需提供 `<div id="root"></div>`。

```tsx
import { createRoot } from 'react-dom/client';
import { Button, ThemeProvider, ThemeToggle } from '@badnpm/ui';

// 默认组件样式。
import '@badnpm/ui/styles/index.css';
// 可选，应用页面主题配色和滚动条样式。
import '@badnpm/ui/styles/custom.css';
// 可选，使用 Geist 字体。
import '@badnpm/ui/styles/font/geist.css';

function App() {
  return (
    <ThemeProvider>
      <Button>保存</Button>
      <ThemeToggle />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
```

按需引入 custom.css 和字体入口，分别控制页面配色、滚动条和字体。
`ThemeToggle` 通过 `ThemeProvider` 读取并切换深浅模式，单独使用 `Button`、`Input` 时可直接渲染。

## CommonJS

`require` 自动选择 `dist/cjs/index.cjs`。以下示例用于支持 CommonJS 且配置了 CSS 处理的浏览器打包入口，HTML 中需提供 `<div id="root"></div>`。

```js
const React = require('react');
const { createRoot } = require('react-dom/client');
const { Button, ThemeProvider, ThemeToggle } = require('@badnpm/ui');

// 这些 CSS require 由应用的打包器处理。
require('@badnpm/ui/styles/index.css');
// 可选页面配色和滚动条样式。
require('@badnpm/ui/styles/custom.css');
// 可选字体。
require('@badnpm/ui/styles/font/geist.css');

const app = React.createElement(
  ThemeProvider,
  null,
  React.createElement(Button, null, '保存'),
  React.createElement(ThemeToggle)
);

createRoot(document.getElementById('root')).render(app);
```

在 Node.js 中进行服务端渲染时，可以直接加载 CJS 组件。CSS 通过浏览器端入口或 HTML 的 `link` 标签加载。

```js
const React = require('react');
const { renderToString } = require('react-dom/server');
const { Button } = require('@badnpm/ui');

const html = renderToString(React.createElement(Button, null, '保存'));
console.log(html);
```

## UMD

将安装包中的 `dist` 目录放到网站静态目录，例如 `public/vendor/ui`。浏览器可以通过 `/vendor/ui/umd/index.js` 加载组件库，通过 `/vendor/ui/styles` 加载样式和字体。部署时保留整个 `styles` 目录结构，使 CSS 中的字体相对路径保持有效。

UMD 导出挂载到 `window.BadUI`。页面先准备 React、ReactDOM 全局对象，再加载组件库。
React 19 的浏览器加载示例采用 ESM CDN，并将 React 显式共享给 ReactDOM，下面使用 import map 配置依赖地址。 [React 官方说明](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#umd-builds-removed)

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>UI 组件示例</title>

    <!-- 默认组件样式。 -->
    <link rel="stylesheet" href="/vendor/ui/styles/index.css" />
    <!-- 可选，应用页面主题配色和滚动条样式。 -->
    <link rel="stylesheet" href="/vendor/ui/styles/custom.css" />
    <!-- 可选，删除此行后使用应用自己的字体。 -->
    <link rel="stylesheet" href="/vendor/ui/styles/font/geist.css" />

    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@19",
          "react-dom": "https://esm.sh/react-dom@19?external=react",
          "react-dom/client": "https://esm.sh/react-dom@19/client?external=react,react-dom"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React from 'react';
      import * as ReactDOM from 'react-dom';
      import { createRoot } from 'react-dom/client';

      window.React = React;
      window.ReactDOM = ReactDOM;

      // 等待全局对象设置完成后再加载 UMD 文件。
      await import('/vendor/ui/umd/index.js');
      const { Button, ThemeProvider, ThemeToggle } = window.BadUI;

      createRoot(document.getElementById('root')).render(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(Button, null, '保存'),
          React.createElement(ThemeToggle)
        )
      );
    </script>
  </body>
</html>
```

通过 HTTP 静态服务访问上述页面。示例中的 CDN 地址可替换为应用自行托管的 React 依赖地址。
UMD 已合并普通运行依赖，React 与 ReactDOM 由页面提供，CSS 通过 `link` 独立加载。

## TypeScript

ESM 使用 `dist/types/index.d.ts`，CommonJS 使用 `dist/cjs/types/index.d.ts`，包的 `exports` 会根据导入方式选择对应声明。两份声明均按源码目录逐文件生成。

TypeScript 项目可以加载构建工具提供的 CSS 类型声明，例如 Vite 的 `vite/client`。
也可在应用纳入编译范围的声明文件（例如 `src/styles.d.ts`）中统一添加：

```ts
declare module '*.css' {}
```

## 构建与打包

在仓库根目录执行：

```sh
pnpm --filter @badnpm/ui build
npm pack ./packages/ui --pack-destination /tmp
```

构建命令直接运行 `rollup -c`，产物目录如下：

```text
dist/
├── esm/                 # ESM 模块
├── types/               # 按源码结构生成的 ESM 类型声明
├── cjs/                 # CommonJS 模块，types 子目录提供逐文件类型声明
├── umd/index.js         # 浏览器单文件，导出 window.BadUI
└── styles/              # 预编译入口、Tailwind 原始入口、可选样式与字体
    └── source/          # Tailwind 入口的完整 CSS 依赖图（含第三方扩展及许可证）
```

TypeScript 插件编译 JS，rollup-plugin-dts 配合 preserveModules 按源码目录逐文件生成类型声明。PostCSS 编译独立 CSS 并处理字体资源，样式规则集中在 `postcss.config.mjs`。
声明生成阶段会将目录导入和源码路径别名转换为完整相对路径，兼容使用方的 NodeNext 类型解析。
入口和依赖统一在包根目录的 `package.json` 中维护。工作区 demo 的 Vite 别名指向源码，保留本地热更新。

### 样式构建配置的位置

Rollup 主配置只负责组装，两个样式交付流程分别维护在 scripts 目录：

- `scripts/build-precompiled-styles.mjs`：非 Tailwind 模式，配置 CSS 入口、PostCSS 预编译、独立 CSS 提取和字体许可证输出。
- `scripts/build-tailwind-styles.mjs`：Tailwind 模式，收集原始 CSS 导入图、打包第三方扩展与许可证、改写发布路径并注册文件监听，不生成工具类。
- `postcss.config.mjs`：预编译流程使用的 Tailwind 与字体资源处理配置。

两个模块由 `rollup.config.mjs` 引用，不需要分别执行命令；一次 build 仍同时生成两种交付产物。
