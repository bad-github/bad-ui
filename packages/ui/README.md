# UI components

React 19 组件库，提供 ESM、CommonJS、UMD 三种产物，以及独立的预编译 CSS。

## 安装

包发布后，在应用中安装组件库及 React 依赖：

```sh
npm install @badnpm/ui react@^19 react-dom@^19
```

当前包标记为 private，发布前可使用本地 tarball 验证。下文统一使用当前包名 `@badnpm/ui`。

## 样式入口

三种 JS 格式共用 `dist/styles`，JS 入口不会自动加载 CSS。

| 样式入口                           | 用途                                        | 引入方式                     |
| ---------------------------------- | ------------------------------------------- | ---------------------------- |
| `@badnpm/ui/styles/index.css`      | Tailwind 重置、组件工具类、主题和基础色变量 | 使用内置组件样式时引入       |
| `@badnpm/ui/styles/body.css`       | 将 `body` 背景色和文字色设为主题颜色        | 按需引入，与默认样式配合使用 |
| `@badnpm/ui/styles/font/geist.css` | 加载 Geist 字体，并设置默认无衬线字体       | 按需引入                     |

仅引入默认样式即可使用组件。页面配色与字体可以分别选择，字体文件随包提供。
主题和基础色已包含在默认样式中。`@badnpm/ui/globals.css` 是默认样式的兼容入口，使用示例统一采用 `styles/index.css`。

使用方无需安装 Tailwind、shadcn、tw-animate-css 或 Geist 字体包。
应用自行编写的额外 Tailwind 类需要由应用自己的 Tailwind 配置生成。

## ESM

适用于支持 TSX 和 CSS 导入的应用构建工具。`import` 自动选择 `dist/esm/index.js`。
以下示例作为浏览器入口使用，HTML 中需提供 `<div id="root"></div>`。

```tsx
import { createRoot } from 'react-dom/client';
import { Button, ThemeProvider, ThemeToggle } from '@badnpm/ui';

// 默认组件样式。
import '@badnpm/ui/styles/index.css';
// 可选，让整个页面的背景色、文字色跟随主题。
import '@badnpm/ui/styles/body.css';
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

删除可选的 CSS 导入，即可由应用自行决定页面配色和字体。
`ThemeToggle` 通过 `ThemeProvider` 读取并切换深浅模式，单独使用 `Button`、`Input` 时可直接渲染。

## CommonJS

`require` 自动选择 `dist/cjs/index.cjs`。以下示例用于支持 CommonJS 且配置了 CSS 处理的浏览器打包入口，HTML 中需提供 `<div id="root"></div>`。

```js
const React = require('react');
const { createRoot } = require('react-dom/client');
const { Button, ThemeProvider, ThemeToggle } = require('@badnpm/ui');

// 这些 CSS require 由应用的打包器处理。
require('@badnpm/ui/styles/index.css');
// 可选页面配色。
require('@badnpm/ui/styles/body.css');
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
    <!-- 可选，删除此行后由应用自行设置 body 配色。 -->
    <link rel="stylesheet" href="/vendor/ui/styles/body.css" />
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
└── styles/              # 默认样式、可选 body 配色和字体资源
```

TypeScript 插件编译 JS，rollup-plugin-dts 配合 preserveModules 按源码目录逐文件生成类型声明。PostCSS 编译独立 CSS 并处理字体资源，样式规则集中在 `postcss.config.mjs`。
声明生成阶段会将目录导入和源码路径别名转换为完整相对路径，兼容使用方的 NodeNext 类型解析。
入口和依赖统一在包根目录的 `package.json` 中维护。工作区 demo 的 Vite 别名指向源码，保留本地热更新。
