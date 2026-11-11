# Storybook 从零到一：组件开发、文档与测试

## 阅读说明

本文先独立介绍 Storybook 的基本概念、安装、组件开发、文档和测试，再在最后说明如何应用到 `bad-ui` 项目。零基础读者可以先完成通用示例，无需了解本仓库结构。

通用部分使用 React + TypeScript + Vite 演示；Storybook 也支持其他框架，框架适配包和部分配置会有所不同。本文仅为教学文档，尚未安装依赖或修改项目配置。

资料核对日期：2026-11-10。示例采用官方当前文档的 Storybook 10.6、React + Vite、CSF 3 写法，测试配置采用 Vitest 4 风格。正式安装时应核对 peer dependencies，并将通过验证的具体版本写入 lockfile；不要把不同大版本教程中的配置拼在一起。

建议阅读顺序：理解基本概念 → 创建演示项目 → 编写第一个 story → 使用文档和预览能力 → 建立测试体系 → 接入 CI → 阅读项目落地建议。

## Storybook 解决什么问题

### 把组件状态变成可独立访问的页面

Storybook 是组件开发工作台。无需进入业务页面，就可以单独查看按钮、输入框、弹窗等组件。

一个 story 描述组件在某种输入和上下文下的状态。例如同一个 Button 可以有默认、禁用、危险操作、图标按钮等 stories。它们既是示例，也可以成为测试用例和截图入口。

例如，开发登录表单时，可以直接查看“输入为空”“密码错误”“正在提交”等场景，无需先完成登录页面、连接后端或操作到相应业务步骤。

Storybook 适合共享组件库、设计系统，也适合业务组件和页面片段的隔离开发。它负责组件工作台与场景组织；真实网站的路由、数据服务和部署仍由应用负责。

### 理解常用术语

| 概念           | 作用                             | 示例                 |
| -------------- | -------------------------------- | -------------------- |
| Story          | 一个可复现的组件场景             | 禁用的保存按钮       |
| CSF            | 用模块导出来描述 stories 的格式  | `Button.stories.tsx` |
| Meta           | 同一文件内 stories 的公共配置    | 组件、分组、默认参数 |
| Args           | 传给组件的 props                 | `disabled: true`     |
| ArgTypes       | 配置 props 的控件和说明          | variant 下拉框       |
| Controls       | 在界面中临时修改 args            | 切换按钮尺寸         |
| Actions        | 观察回调事件                     | 点击后记录 onClick   |
| Decorators     | 给组件补充外层环境               | Provider、容器、路由 |
| Parameters     | Storybook 的配置，不是组件 props | 布局、a11y 规则      |
| Globals        | 工具栏共享的环境选项             | 主题、语言           |
| Play           | 渲染后执行的用户操作与断言       | 点击后验证回调       |
| Autodocs / MDX | 自动生成 API 文档 / 手写说明     | 属性表、使用规范     |

Controls 中点一下、Actions 中出现一条日志，都只是人工观察。写下断言并让测试运行器执行，才形成可重复的自动化检查。

## 从空目录启动 Storybook

### 准备一个演示应用

如果已有 React + Vite 应用，可以跳过创建应用这一步，在该应用的 `package.json` 所在目录继续。

```bash
pnpm create vite@latest storybook-demo --template react-ts
cd storybook-demo
pnpm install
pnpm create storybook@latest
```

选择 React + Vite，并启用文档、测试和无障碍能力。不同版本的 CLI 提问可能不同，以实际生成结果为准。CLI 会安装依赖、生成配置和示例 stories，可能调整 ESLint 与测试配置，应检查这些改动。

使用受支持的 Node LTS，并核对所选 Storybook、Vite、Vitest 的共同版本要求。Storybook 官方包保持相同版本，Vitest 与其 browser、coverage 配套包保持版本一致，将验证后的版本保存在 lockfile 中。

若初始化时未启用测试或无障碍插件，可以在应用目录补充，已经存在时无需重复添加：

```bash
pnpm exec storybook add @storybook/addon-vitest
pnpm exec storybook add @storybook/addon-a11y
```

测试插件会尝试自动配置 Vitest 和 Playwright 浏览器环境。遇到安装浏览器的提示时，需要完成安装才能运行浏览器测试。[官方安装说明](https://storybook.js.org/docs/get-started/install)、[Vitest 插件说明](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index)。

### 认识生成的文件

```text
storybook-demo/
├── .storybook/
│   ├── main.ts
│   ├── preview.tsx
│   └── vitest.setup.ts
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.stories.tsx
│   └── index.css
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

这是完成后续示例时的目标结构。初始化模板可能把 stories 放在 `src/stories`，preview 文件也可能使用 `.ts`；不包含 JSX 时两种扩展名均可。

- `main.ts`：选择框架、扫描 stories、注册插件。
- `preview.tsx`：引入样式、提供公共渲染环境、配置默认参数。
- `*.stories.tsx`：描述组件状态与交互。
- `vitest.config.ts` 和 `vitest.setup.ts`：配置自动化测试。

### 配置故事扫描和插件

`.storybook/main.ts` 的核心配置如下，合并到初始化产物中，不要覆盖 CLI 生成的其他必要选项：

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

路径相对于 `.storybook/main.ts`。React Vite 框架默认读取应用的 Vite 配置；额外配置可通过 `viteFinal` 合并。需要先确认现有配置是否已加载，避免重复注册插件。

### 引入样式并启动预览

`.storybook/preview.tsx`：

```tsx
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' },
  },
};

export default preview;
```

Storybook 不会运行应用的 `main.tsx`，因此应用入口里的 CSS、Provider 和初始化代码不会自然生效，需要在 preview 或 decorator 中显式配置。

启动工作台：

```bash
pnpm storybook
```

通常访问 `http://localhost:6006`。左侧选择 story，中间 Canvas 查看组件，下方 Controls 调整参数、Actions 观察回调；Docs 页面查看文档，Interactions 和 Accessibility 面板用于相应调试。面板是否存在取决于插件配置。

此时应能打开 CLI 生成的示例。接下来创建自己的 Button，确认工作流后再移除演示内容。

## 写出第一个可维护的 story

### 准备一个最小组件

新建 `src/components/Button.tsx`。先使用原生按钮，避免引入第三方组件库影响对 Storybook 的理解：

```tsx
import type { ComponentProps } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        padding: '8px 16px',
        border: '1px solid #555',
        borderRadius: 6,
        background: variant === 'primary' ? '#1d4ed8' : '#fff',
        color: variant === 'primary' ? '#fff' : '#111',
        ...style,
      }}
    />
  );
}
```

这里的内联样式仅用于让示例独立运行；正式组件可使用 CSS、CSS Modules 或其他样式方案。

### 用 CSF 描述组件状态

新建 `src/components/Button.stories.tsx`：

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: '保存',
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Clickable: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '保存' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: '保存' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
```

`default export` 提供公共 meta，命名导出各自成为一个 story；`title` 决定侧边栏层级。`satisfies` 校验配置与组件类型，`StoryObj<typeof meta>` 复用类型信息。各 story 的 args 会覆盖公共 args。

保存后，在侧边栏打开 `UI/Button`，切换 Default、Secondary 和 Disabled；在 Controls 中修改文字，在 Clickable 中查看 play 的执行过程。

`fn()` 提供可断言的回调，也能供 Actions 面板观察。每次测试应重置 mock；采用官方测试集成的生命周期，避免手工重用带有历史调用记录的全局 spy。

### 用状态表达需求

建议优先写这些状态：默认、变体、禁用、长文本、图标可访问名称、错误、加载、空数据。只为组件真实支持的状态编写 story；示例 Button 没有专用 `loading` prop，不应向它传入不存在的接口。

重要状态应导出为稳定的 story。仅通过 Controls 临时调出的状态，通常不会自动成为批量测试或截图的独立用例。

主题、尺寸、变体之间避免无差别做笛卡尔积。先覆盖默认组合，再补高风险组合，例如深色下的危险操作按钮、窄屏下的长文本输入。

### 组织文档

Autodocs 适合属性、默认值和示例；MDX 适合使用时机、设计规则、错误用法和多个组件的组合说明。启用 `autodocs` 不代表能正确解释所有业务语义，复杂 props 仍需补充 JSDoc 和 `argTypes.description`。

组件较少时使用 `UI/Button`、`UI/Input`；有组合组件后再增加 `Patterns/...` 和 `Pages/...`，不要提前堆叠过深目录。

## 为组件补充环境与文档

### 使用 decorators 提供外层环境

纯组件可以直接渲染；依赖 Context、路由、国际化或数据缓存的组件，需要提供对应环境。decorators 可以配置在全局 preview、组件 meta 或单个 story 上。

例如，在某个组件的 meta 中增加容器：

```tsx
decorators: [
  (Story) => (
    <div style={{ width: 320, padding: 24 }}>
      <Story />
    </div>
  ),
],
```

Provider 的包裹方式相同。全局只放所有 stories 都需要的环境，局部依赖放在对应组件，避免无关初始化与状态污染。

### 区分 args、parameters 与 globals

`args` 改变组件输入，例如 `disabled`；`parameters` 改变 Storybook 行为，例如 `layout: 'fullscreen'`；`globals` 表示主题、语言等共享环境选项。

工具栏选项需要由 decorator 或插件连接到真实渲染环境。仅添加一个“深色”菜单，不会自动使组件切换主题；修改背景色也不等于完整切换主题变量。

### 从示例扩展为可阅读的文档

先使用 Autodocs 自动生成属性与 stories 展示，再通过 MDX 补充“何时使用”“如何组合”“有哪些限制”。文档中的示例应尽量引用现有 stories，减少两份示例逐渐不一致的情况。

设计师可以通过工作台审查状态，开发者通过 Controls 探索 API，测试人员通过固定 story 复现缺陷。静态构建后也可以把相同内容发布给团队。

## 先看懂测试方案的分工

### 测试类型与工具不是同一个维度

交互、视觉和无障碍描述“验证什么”；Vitest addon、test-runner、Playwright 描述“由谁执行”。同一个 story 可以同时参与多个检查。

| 测试方案       | 能发现什么                     | 常用实现                     | 覆盖不到什么               |
| -------------- | ------------------------------ | ---------------------------- | -------------------------- |
| 渲染冒烟       | 某个状态无法挂载、缺 Provider  | Vitest addon 执行 stories    | 不证明视觉和业务正确       |
| 交互测试       | 点击、输入、提交、焦点行为错误 | `play` + 断言 + Vitest addon | 不覆盖真实后端和完整导航   |
| 无障碍自动检查 | 缺名称、部分 ARIA 和对比度问题 | a11y addon + axe             | 无法代替键盘和读屏人工检查 |
| 视觉回归       | 间距、颜色、字体、溢出变化     | Chromatic 或 Playwright 截图 | 无法单靠截图证明行为正确   |
| DOM 快照       | DOM 结构和属性意外改变         | Vitest snapshot              | 无法比较实际 CSS 渲染      |
| 纯逻辑单元测试 | 工具函数、状态转换的边界错误   | 普通 Vitest 项目             | 不验证浏览器布局           |
| 端到端测试     | 路由、认证、真实系统集成错误   | Playwright 访问运行中的应用  | 成本高，不适合穷举组件变体 |
| 覆盖率分析     | 哪些源码没有被测试执行         | Vitest coverage              | 执行过不代表有有效断言     |

初次引入时，可先接通渲染、交互和 a11y，再为核心组件增加视觉回归；纯逻辑和应用 E2E 按各自职责补充。

## 渲染与交互测试

### 从人工预览到批量运行

人工在 Storybook 中打开 story，可以调试它的 `play`。Vitest addon 把 stories 转为真实浏览器中的组件测试，可批量执行渲染和交互检查。没有 `play` 的 story 也可以参与渲染测试。[交互测试说明](https://storybook.js.org/docs/writing-tests/interaction-testing)。

断言优先选择用户能感知的结果：按钮是否可用、错误提示是否出现、回调参数是否正确、焦点是否移动。避免以 class 名或内部 state 作为主要判断依据。

查询优先使用 `getByRole` 和可访问名称；异步出现的元素使用 `findByRole`；等待异步断言使用 `waitFor`。不要靠固定 sleep 等网络、动画或状态更新。

Portal 弹层可能渲染在 canvas 容器外，容器内查不到时，应明确查询当前预览文档的 body，不能误查 Storybook 管理界面的 DOM。测试 Tab、Escape、Enter 等操作时也要验证焦点变化。

### 配置 Vitest 浏览器项目

优先使用 CLI 自动配置。以下是 Vitest 4 的手工核对模板，保存到 `vitest.config.ts`；相关依赖需由初始化或后续安装提供：

```ts
import { resolve } from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: resolve(import.meta.dirname, '.storybook'),
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
            },
            setupFiles: ['./.storybook/vitest.setup.ts'],
          },
        },
      ],
    },
  })
);
```

`.storybook/vitest.setup.ts`：

```ts
import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as a11yAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview';

const project = setProjectAnnotations([a11yAnnotations, projectAnnotations]);
beforeAll(project.beforeAll);
```

这个 setup 让测试继承 Storybook 的 decorators、loaders 和 a11y 配置。遗漏它可能出现“预览正常，测试缺上下文”的情况。配置模板以选定版本的官方生成产物为准，不同时混用 Vitest 3 的旧 browser provider 写法。[配置参考](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index)。

初始化后，在 `package.json` 合并以下 scripts：

```json
{
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build",
  "test-storybook": "vitest run --project=storybook",
  "test-storybook:watch": "vitest --project=storybook"
}
```

在演示应用目录运行：

```bash
pnpm storybook
pnpm test-storybook
pnpm test-storybook:watch
pnpm build-storybook
```

这些是独立命令。CLI 执行 Vitest addon 测试通常不要求先启动 6006 服务，也不要求先构建 Storybook；测试运行与静态文档构建分别验证不同问题。

### 如何选 Vitest addon 和 test-runner

对于本文的 Vite 演示应用，优先 Vitest addon。旧教程常见的 `@storybook/test-runner` 主要用于已有方案或不适合 Vitest addon 的环境：它会访问已经运行或部署的 Storybook，遍历 stories，执行渲染与 play。

不要为了“覆盖更多”让两套运行器重复执行全部 stories。只有确实需要兼容旧架构或验证部署产物时，才增加对应流程。[test-runner 文档](https://storybook.js.org/docs/writing-tests/integrations/test-runner)。

## 无障碍测试

### 让自动检查成为门禁

`@storybook/addon-a11y` 基于 axe 检查渲染结果。安装插件、保留测试 setup 中的 a11y annotations，并在 preview 设置：

```ts
parameters: {
  a11y: { test: 'error' },
}
```

`error` 将违规转成测试失败；`todo` 用于暂存待修问题，`off` 关闭该 story 的自动检查。例外应局部配置并记录原因，避免全局关闭规则掩盖问题。[a11y 配置说明](https://storybook.js.org/docs/writing-tests/accessibility-testing)。

### 补充键盘和人工验证

为 Input 提供关联 label；为纯图标 Button 提供可访问名称。弹窗类组件加入打开、关闭、Escape、焦点限制与焦点恢复的交互测试。

自动扫描通过后，仍需人工检查 Tab 顺序、焦点可见性、读屏宣布内容、缩放和高对比度体验。对于错误提示和动态状态，也要检查提示出现后的可感知性。

## 视觉回归测试

### 截图比较的基本流程

先生成并人工确认基线，再对新提交截图，比较差异；差异可能是回归，也可能是预期改版，需审查后再更新基线。首次通过只表示建立了基线。

渲染测试成功、交互断言通过，都不会自动生成截图基线。[视觉测试概念](https://storybook.js.org/docs/writing-tests/visual-testing)。

### 使用 Chromatic

适合希望快速获得托管截图、分支基线、差异审查和 PR 协作的团队。在演示应用中安装 Chromatic CLI 后，构建上传，例如：

```bash
pnpm exec chromatic --project-token="$CHROMATIC_PROJECT_TOKEN"
```

使用 CI secret 注入 token。项目需另行创建并配置，官方 Visual Tests addon 可提供 Storybook 内的入口；仅装 Vitest addon 不会自动开通 Chromatic。[Chromatic CLI 文档](https://www.chromatic.com/docs/cli/)。

采用前评估源码/构建产物上传要求、截图配额和团队审查方式，价格及套餐以使用时官网为准。

### 使用 Playwright 自建截图

适合希望自行保存基线并控制运行环境的团队。需要单独配置 `@playwright/test`，启动或托管 Storybook，并维护浏览器版本和基线产物。

下面是独立截图测试的最小示意；前提是服务已运行在 6006，且 `UI/Button` 的 `Default` story 保持上述命名：

```ts
import { test, expect } from '@playwright/test';

test('默认按钮外观', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto('http://localhost:6006/iframe.html?id=ui-button--default&viewMode=story');
  const button = page.getByRole('button', { name: '保存' });
  await expect(button).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(button).toHaveScreenshot('button-default.png', {
    animations: 'disabled',
  });
});
```

这里访问预览 iframe，避免把侧边栏和工具栏也截进去。story ID 应从实际地址核对；修改 title 或 export 名可能改变 ID。含 `play` 或异步数据的复杂 story，截图前还要等待业务就绪标志，单纯 `visible` 不代表交互已结束。[Playwright 截图文档](https://playwright.dev/docs/test-snapshots)。

在相同 CI 环境中生成和比较基线，保存 expected、actual、diff 供审查。若截图只覆盖按钮，无法发现页面整体布局回归；组合场景要选择相应容器或页面截图。

### 降低截图噪声

固定浏览器、操作系统、viewport、DPR、字体、时区和主题；使用确定的日期、ID、图片和 mock 数据。关闭动画并等待资源就绪。

Toolbar 中选择过某个主题或 viewport，不代表所有测试都自动遍历它。需要显式定义 stories、测试项目或截图参数，建立浅色/深色、桌面/窄屏的覆盖矩阵。先覆盖高风险组合，避免基线数量失控。

## DOM 快照与纯逻辑测试

### DOM 快照适合小而稳定的输出

DOM 快照记录结构与属性，截图快照记录像素。CSS 颜色改变可能完全不影响 DOM 快照，因此不能用它验证样式。

对于已有明确 role、文本和回调断言的组件，不建议再大规模保存整棵 DOM。大量实现细节变化会造成快照噪声，让审查退化为机械更新。[快照测试说明](https://storybook.js.org/docs/writing-tests/snapshot-testing)。

### 复用 stories，但保留测试边界

如果某些单元测试需要复用 story 的 args、decorators，可通过框架的 Portable Stories API（如 `composeStories`）组合后测试，避免复制场景配置。它仍需配置相应测试环境，不会自动把普通 Node 测试变成真实浏览器测试。

工具函数、数据校验、状态转换等纯逻辑，适合独立 Vitest 单元测试。DOM 行为、系统主题监听、localStorage 同步等浏览器集成行为，再交给组件测试或应用级测试。

## 网络模拟与测试隔离

### 为网络状态建立稳定场景

未来出现请求数据的组件时，建议使用 MSW 2 + `msw-storybook-addon` 拦截请求，分别编写成功、空数据、加载、错误和重试的 stories。这样可以验证真实请求调用路径，又不依赖外部服务在线。

接入时需安装依赖、生成 worker、通过 Storybook `staticDirs` 提供 worker 文件，并在 preview 中初始化 MSW、注册 `mswLoader`；每个 story 通过 `parameters.msw.handlers` 声明响应。仅写 handler 而不启动 worker 不会生效。[官方网络 mock 教程](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-network-requests)。

断言最终展示或请求结果，不能只验证 mock 被调用。加载状态可用受控延迟模拟；避免无限等待使自动化测试无法结束。

### 每个 story 应独立运行

不要依赖前一个 story 修改过的 localStorage、cookie、全局 store 或 DOM class。通过 story 的 `beforeEach`、测试生命周期或 Provider 的重建初始化环境，必要时返回清理函数。

对于主题或偏好设置组件，需要特别处理根节点类名、全局事件监听和持久化存储。固定截图场景应与“跟随系统”“跨标签页同步”等行为测试分开设置。

## 覆盖率与端到端测试

### 用覆盖率寻找遗漏

启用 Vitest 对应版本的 coverage provider 后，可运行：

```bash
pnpm exec vitest run --project=storybook --coverage
```

coverage 配置放在 Vitest 根级 `test.coverage`。显式包含 `src/components/**/*.{ts,tsx}`，按需包含 providers 和 hooks，并排除 stories 和类型文件；检查报告确实覆盖目标源码。[覆盖率说明](https://storybook.js.org/docs/writing-tests/test-coverage)。

行覆盖率用于找没执行到的代码，分支覆盖率用于找条件遗漏；二者都不能证明断言充分。不要把 Button 的样式变体数直接等同于代码分支数，也不要只为追求百分比写没有用户价值的测试。

### 通过应用 E2E 验证真实链路

Storybook 可以验证一个表单组件在 mock 登录成功后显示正确内容，但无法证明真实认证、路由和后端集成有效。关键应用流程应让 Playwright 访问实际运行的 Web 应用。

控制 E2E 数量，覆盖少量核心路径；大量组件状态交给 stories。这样失败时更容易判断是组件行为、视觉还是系统集成出了问题。

## 将测试接入日常开发与 CI

### 本地开发流程

先补充或调整 story，再修改组件；交互需求加入 play 断言，样式需求检查对应主题与屏幕组合。提交前运行类型检查、组件测试和 Storybook 构建。

类型检查不能被运行测试替代：Vite 能转译 TypeScript，不代表完成类型校验。接入后要检查 tsconfig 范围，将 `.storybook`、Vitest 配置及 stories 纳入相应检查。演示项目若没有 `typecheck` 脚本，可添加 `"typecheck": "tsc -b"`，或使用适合自身 TypeScript 项目结构的命令。

### CI 最小执行链

以下为命令顺序示例，前提是已经按本文完成安装、配置和 scripts：

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm typecheck
pnpm test-storybook
pnpm build-storybook
```

Linux CI 通常还需要 Playwright 的系统依赖；浏览器安装应匹配 lockfile 中的 Playwright 版本。Vitest addon 使用的浏览器依赖应能从应用目录解析。

随后按选型增加 Chromatic，或 Playwright 截图任务。自建截图任务要先启动构建后的 `storybook-static` 静态服务并等待就绪；推荐在 Playwright 的 `webServer` 配置里管理生命周期。不要把没有服务就绪保障的后台启动命令直接塞入 CI。

### PR 门禁与产物

| 检查            | 失败处理                 | 建议产物             |
| --------------- | ------------------------ | -------------------- |
| 类型检查 / 构建 | 修复类型、配置、资源引用 | 构建日志、静态预览   |
| 渲染 / 交互     | 复现失败 story 并修复    | 测试报告             |
| a11y            | 修复违规，例外需注明依据 | 规则与元素定位       |
| 视觉差异        | 审查变更后修复或更新基线 | 对比图或托管审查链接 |
| 应用 E2E        | 检查实际业务链路         | trace、截图和日志    |

### 构建与发布工作台

```bash
pnpm build-storybook
```

默认生成 `storybook-static`，可以部署到静态托管服务或团队内部站点。构建成功后还应通过 HTTP 服务预览产物，确认字体、图片和资源路径正常。部署 Storybook 只发布组件工作台，不会发布业务应用。

## 常见问题与排查方向

| 现象                      | 优先检查                                                   |
| ------------------------- | ---------------------------------------------------------- |
| 组件无样式                | preview 是否导入 UI styles，Tailwind 插件是否加载          |
| 某些工具类没有生成        | `@source` 是否覆盖 story，是否使用动态 class 拼接          |
| 找不到共享包或别名        | workspace 依赖是否存在，Vite alias 是否继承                |
| 主题不按默认值变化        | localStorage 是否覆盖默认值，根元素类名是否残留            |
| Provider hook 报错        | meta/decorator 是否补齐上下文，测试 setup 是否继承 preview |
| 弹层查询不到              | 是否渲染到 Portal，查询范围是否正确                        |
| 本地通过但 CI 失败        | 浏览器及系统依赖、字体、主题、异步等待是否一致             |
| a11y 面板有问题但 CI 通过 | 是否设置 `test: 'error'`，setup 是否导入 a11y annotations  |
| 构建成功但交互失败        | build 不能替代 Vitest，是否真正执行测试脚本                |
| 快照频繁变化              | 是否包含随机数据、动画、日期或系统差异                     |

旧文章中的 `@storybook/testing-library`、`@storybook/jest` 和实验性 test 插件，不应直接用于本文的新接入方案。这里使用 `storybook/test`、`@storybook/addon-vitest`；插件与 API 以选定主版本文档为准。

## 在 bad-ui 项目中落地

### 项目现状与建议

当前仓库使用 pnpm workspace 和 Turborepo：

- `apps/web`：React 19、Vite 8，已有 React 插件、Tailwind Vite 插件和 `@` 别名。
- `packages/ui`：共享组件包 `@badnpm/ui`，使用 Base UI、Tailwind CSS 4，包含 Button、Input、ThemeToggle 和主题相关 Provider。
- Web 应用通过 `@badnpm/ui/styles/index.css` 引入全局样式。
- 仓库根目录目前没有 Storybook 或测试运行脚本。

建议先把 Storybook 的运行配置和测试依赖放在 `apps/web`，stories 与 `packages/ui` 的组件放在一起。这样可以复用已有 Vite 环境，同时让组件的示例随组件维护。若未来组件文档需要独立发布和独立管理依赖，再迁移到 `apps/storybook`。

```text
apps/web/
├── .storybook/
│   ├── main.ts
│   ├── preview.tsx
│   └── vitest.setup.ts
├── vite.config.ts
├── vitest.config.ts
└── package.json
packages/ui/src/components/
├── button.tsx
├── Button.stories.tsx
├── input.tsx
└── Input.stories.tsx
```

Story 文件可以采用 PascalCase，而组件保持项目当前的小写文件名；导入时注意大小写。共享包不必为了保存 story 而导出它，也不要从组件包入口导出 stories。

### 将通用配置映射到仓库

在 `apps/web` 中执行 `pnpm create storybook@latest`，让 CLI 识别现有应用。通用教程中的文件位置按下面映射：

| 通用教程                       | 当前项目                                   |
| ------------------------------ | ------------------------------------------ |
| `.storybook/*`                 | `apps/web/.storybook/*`                    |
| `vitest.config.ts`             | `apps/web/vitest.config.ts`                |
| `src/components/*.stories.tsx` | `packages/ui/src/components/*.stories.tsx` |
| `../src/index.css`             | `@badnpm/ui/styles/index.css`                     |
| `./Button`                     | 相邻 story 中使用 `./button`               |

将 `main.ts` 的 stories 扫描范围改为：

```ts
stories: [
  '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
  '../src/**/*.stories.@(ts|tsx)',
  '../src/**/*.mdx',
],
```

在 preview 中使用 `import '@badnpm/ui/styles/index.css'`。现有 `apps/web/vite.config.ts` 已包含 React、Tailwind Vite 插件及 `@` 别名，先确认继承生效，避免重复配置。

通用示例 Button 是教学用原生组件。实际落地时直接为现有 Button 写 story，不要替换组件实现；variant 使用现有的 `default`、`outline`、`secondary`、`ghost`、`destructive`、`link`，size 使用真实支持的值。禁用状态和点击回调断言可以沿用教学思路。

### 处理主题与持久化环境

Button、Input 等纯组件不必统一包上所有 Provider。ThemeToggle 等调用主题 hook 的组件，应在对应 meta 的 decorator 中包裹 `ThemeProvider` 和实际需要的 `PreferenceProvider`。

当前 `ThemeProvider` 会读取 localStorage、修改文档根节点类名，并注册快捷键。做主题测试时，在渲染前重置专用 storage key、固定系统主题，并在结束后恢复。`defaultTheme` 不会覆盖已保存的主题，仅修改默认值不足以固定测试环境。

Tailwind 的 `@source` 要覆盖 stories 所在目录。当前 UI 样式已扫描自身 `src`，就近放置的 stories 可被覆盖；未来迁往新目录时需重新检查。

### 配置共享包的测试与类型检查

测试依赖和通用 scripts 先放在 `apps/web`。在仓库根目录执行：

```bash
pnpm --filter web storybook
pnpm --filter web test-storybook
pnpm --filter web build-storybook
```

这些脚本需要先按通用章节添加。覆盖率应显式包含 `../../packages/ui/src/components/**/*.{ts,tsx}`，按需加入 providers、hooks，确保共享包源码出现在报告中。

stories 与组件放在共享包后，还需核对 `packages/ui` 的 TypeScript 和 ESLint 检查如何解析 Storybook 类型依赖；pnpm 不应依赖偶然的提升结果。可以给共享包添加必要的开发依赖，或建立专门检查 stories 的配置，避免出现“运行器能运行，但类型检查找不到依赖”的情况。

项目当前 Node 下限为 `20.19.0`，实际运行版本仍要满足最终选定依赖的共同要求。接入后分别检查 Web 与 UI 包的类型检查范围，不能以 Storybook 构建代替类型检查。

### 纳入 Turborepo 与 CI

先使用 `pnpm --filter web ...` 验证流程；需要纳入 Turbo 时，为开发任务配置 `persistent: true`、`cache: false`，为构建声明 `storybook-static/**` 输出。缓存输入要覆盖共享 UI、样式和相关环境变量变化。

CI 复用通用章节的执行顺序，将应用命令换成 `--filter web`；仓库级类型检查继续使用根目录 `pnpm typecheck`。首次接入先建立组件测试门禁，再选择视觉回归服务或自建截图流程。

### 建立最小闭环

先接通样式、Button 和 Input stories，完成一次本地预览、批量交互测试、a11y 检查和静态构建。验收重点是：能发现一个故意写错的断言和一个缺可访问名称的示例，修复后恢复通过。

### 覆盖主题与真实交互

补齐 ThemeToggle 的上下文、持久化与快捷键场景，明确环境清理规则。为深浅色、主要变体和长文本建立少量稳定场景。

### 加入视觉审查和团队门禁

选定 Chromatic 或自建截图，用核心组件建立可信基线，再接入 PR 审查。新增组件时，把 stories、必要交互断言和视觉状态作为同一项工作的交付内容。

达到“组件可独立查看、状态可复现、测试可自动失败、差异可审查”后，再扩展页面级 stories、网络模拟和更大的覆盖矩阵。
