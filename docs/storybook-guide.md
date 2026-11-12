# Storybook 从零到一：组件开发、文档与测试

## 阅读说明

本文先独立介绍 Storybook 的基本概念、安装、组件开发、文档和测试，再在最后说明如何应用到 `bad-ui` 项目。零基础读者可以先完成通用示例，无需了解本仓库结构。

通用部分使用 React + TypeScript + Vite 演示；Storybook 也支持其他框架，框架适配包和部分配置会有所不同。通用章节为教学示例；本仓库已完成基础集成，实际目录、命令和范围见末尾“在 bad-ui 项目中落地”。

资料核对日期：2026-11-11。示例采用官方当前文档的 Storybook 10.6、React + Vite、CSF 3 写法，测试配置采用 Vitest 4 风格。正式安装时应核对 peer dependencies，并将通过验证的具体版本写入 lockfile；不要把不同大版本教程中的配置拼在一起。

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
│   ├── manager.ts
│   ├── preview.tsx
│   ├── preview-head.html
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

本项目将 Storybook 直接集成在 `packages/ui`，包名为 `@badnpm/ui`。`apps/web` 继续作为应用演示入口，Storybook 负责组件独立预览和文档。

### 安装开发依赖

在仓库根目录执行，安装前确认命令：

```bash
pnpm --filter @badnpm/ui add -D storybook @storybook/react-vite @storybook/addon-docs @storybook/addon-a11y vite
```

本次安装版本为 Storybook 及上述官方插件 `10.6.6`、Vite `8.3.5`，具体依赖树由 `pnpm-lock.yaml` 固定。已有 React 19、TypeScript 6、Tailwind 4 和 `@tailwindcss/postcss`，无需重复安装。后续检出仓库使用 `pnpm install --frozen-lockfile` 恢复依赖。

本次使用 Node `24.22.1` 验证；根目录原有 `engines` 下限不代表所有工具组合都已在该下限运行验证。

### 添加 Storybook 配置

```text
packages/ui/
├── .storybook/
│   ├── main.ts
│   ├── manager.ts
│   ├── preview.tsx
│   ├── preview-head.html
│   ├── types/vite-env.d.ts
│   ├── theme/storage-keys.ts
│   ├── theme/events.ts
│   ├── theme/docs-channel.ts
│   ├── manager/theme-config.ts / theme-storage.ts / theme-tool.tsx
│   ├── decorators/with-theme.tsx
│   ├── decorators/sync-manager-theme.tsx
│   └── components/preview-frame.tsx / preview-frame.css
└── src/components/
    ├── button.tsx
    ├── input.tsx
    ├── Input.stories.tsx
    └── theme-toggle.tsx
```

Storybook 按配置目录中的**固定入口名 `main`、`manager`、`preview`**识别以下文件，无需互相 import。文件名主体不能随意更改；可使用当前 Storybook 版本支持的扩展名，例如本项目的 `.ts`、`.tsx`。

**将 `manager.ts` 改名为 `manager1.ts`，Storybook 就不会自动加载它。** `main1.ts`、`preview1.tsx` 同样不会被当作对应入口。若要拆分实现，必须保留约定入口，例如：

```ts
// .storybook/manager.ts：Storybook 自动识别的入口
import './manager1'; // 辅助文件通过普通模块导入执行
```

辅助文件的加载方式需要符合入口约定：`main.ts`、`preview.tsx` 拆分配置对象时，还需通过默认导出向 Storybook 提供最终配置。

| 文件          | 加载环境              | 作用                                                                                 |
| ------------- | --------------------- | ------------------------------------------------------------------------------------ |
| `main.ts`     | Node.js 启动/构建进程 | 声明框架、addons、stories 扫描范围及 Vite 配置；默认导出配置对象                     |
| `manager.ts`  | 浏览器中的外围界面    | 通过 `addons.setConfig` 配置侧边栏、顶部工具栏和插件面板；执行配置代码，无需默认导出 |
| `preview.tsx` | 浏览器中的预览 iframe | 导入组件样式，默认导出全局 decorators、parameters、tags 等配置                       |

在本项目中，`pnpm --filter @badnpm/ui storybook` 会在 `packages/ui` 目录运行 `storybook dev`。CLI 默认查找当前目录下的 `.storybook`，也可通过 `--config-dir`（简写 `-c`）指定其他配置目录。静态构建同样使用该目录。

Storybook 先在 Node.js 中读取 `main.ts` 确定构建方式、插件及 story 文件范围，再将 `manager.ts` 加入外围界面的构建入口，将 `preview.tsx` 加入预览构建入口。浏览器加载这两个环境的产物时分别执行对应代码；并不是把目录下所有文件都自动执行。`with-theme.tsx`、`preview-frame.tsx` 等辅助文件通过普通 import 被加载；`vite-env.d.ts` 只供 TypeScript 检查，不参与运行。

`manager.ts` 通过 `manager/theme-storage.ts` 读取 `bad-ui:storybook:manager-theme`，恢复外围主题，无有效记录时默认深色，并显式调用 `manager/theme-tool.tsx` 的注册函数。辅助文件通过 `addons.register`、`addons.add` 和 `types.TOOL` 在顶部工具栏添加深浅色切换按钮，Canvas 与 Docs 页面均可使用。

manager 的 JSX 构建流程独立于 Vite 预览配置；工具栏 TSX 文件显式 `import * as React from 'react'`，确保经典 JSX 转换生成的 `React.createElement` 有对应的运行时变量，避免 `React is not defined`。仅通过 TypeScript 检查不能证明浏览器中不存在此问题。

按钮使用 Storybook 的 `IconButton`，通过 `useTheme` 读取外围当前主题，点击时调用 `useStorybookApi().setOptions({ theme })` 更新外围配置。按钮文字显示当前主题：浅色时显示 `light`，深色时显示 `dark`；title 和可访问名称说明切换目标。无需新增依赖。工具栏切换时保存外围偏好，刷新后恢复。读写 localStorage 失败时不会阻止界面运行；读取失败时默认深色。存储键与预览 Provider 的 `bad-ui:storybook:theme` 独立，预览单独切换不会改变外围选择。外围变化会单向同步到预览区 ThemeProvider，Docs 正文通过独立容器订阅同一个外围主题。新增或修改主配置、manager 配置后建议重启 Storybook，确保入口重新构建。

配置入口和主题 API 参考：[配置说明](https://storybook.js.org/docs/configure)、[外围界面主题](https://storybook.js.org/docs/configure/user-interface/theming)、[预览渲染环境](https://storybook.js.org/docs/configure/story-rendering)。

`main.ts` 使用 `@storybook/react-vite`，扫描 `../src/**/*.stories.@(ts|tsx)`，启用 Docs 和 a11y。Vite 别名将 `@badnpm/ui` 指向本包 `src`，因此组件和样式直接从源码加载，无需先构建 `dist`。

通过 `viteFinal` 显式配置 Tailwind PostCSS 插件，扫描基目录为 `src`。这里不直接使用 `postcss.config.mjs`：该文件供 Rollup 发布构建使用，包含复制字体的 `postcss-url`，在 Storybook 中会干扰 Vite 自身的字体 URL 重写。Storybook 保留 Tailwind 编译，把字体打包交给 Vite。

`preview-head.html` 是 Storybook 按固定文件名识别的 HTML 注入入口，内容放在预览 iframe 的 `<head>` 中，早于 React story 挂载。预览 loading 直接使用 Neutral 基础色对应的最终颜色值，首帧无需等待外部 CSS 请求，不再编译变量。完整组件样式、页面配色和字体仍在 `preview.tsx` 中导入，保留热更新。不要在注入片段中直接链接源码 CSS，Storybook 的注入阶段晚于 Vite HTML 处理，静态构建不会自动改写这些链接。

Storybook 的 localStorage 键统一在 `.storybook/theme/storage-keys.ts` 维护：`themeStorageKeys.manager` 用于外围，`themeStorageKeys.preview` 用于组件预览。TS/TSX 文件直接导入常量；`main.ts` 的 `previewHead` 只在已有 head 内容之前注入 `window.__STORYBOOK_THEME_STORAGE_KEYS__` 对象。主题恢复逻辑仍写在 `preview-head.html`：优先使用对象中的 key，未注入对象或对应字段时，回退到 `bad-ui:storybook:theme` 和 `bad-ui:storybook:manager-theme`。没有占位符替换，也不再生成整段主题脚本。该钩子不编译或注入 CSS。正常集成时修改 key 只需改常量；HTML 中的具体字符串仅作缺少注入时的默认值，已有记录不会自动迁移。

另外，Storybook 外围还有一层 `LoaderWrapper`，在 iframe 尚未就绪时显示。它使用 manager 的 `appPreviewBg`，不是 iframe 内的 loading 样式。`manager/theme-config.ts` 直接设置最终颜色：浅色为 `oklch(1 0 0)`，深色为 `oklch(0.145 0 0)`，对应当前 Neutral 基础色的背景。外围无需 `managerHead` 注入变量，也无需设置 `data-preview-theme` 属性；调整组件库基础背景色时需同步这些值。外围通过 globals 向预览同步主题的逻辑仍保留。

首帧脚本优先读取预览的 `bad-ui:storybook:theme`，没有有效值时才读取外围的 `bad-ui:storybook:manager-theme`；两者都无有效值或存储不可访问时默认深色。预览存储为 `system` 时解析系统配色，使 loading 与恢复后的预览主题一致。脚本仅用于首次绘制，后续由 ThemeProvider 和外围同步接管。loading 遮罩背景为浅色 `oklch(1 0 0)` / 深色 `oklch(0.145 0 0)`，文字为浅色 `oklch(0.145 0 0)` / 深色 `oklch(0.985 0 0)`，转圈圆环为浅色 `oklch(0.97 0 0)` / 深色 `oklch(0.269 0 0)`。这些值对应 Neutral 中的背景、前景和弱化色，调整基础色时需同步。body 的固定颜色只用于 loading 阶段，story 显示后仍使用组件库样式。

`.storybook/types/vite-env.d.ts` 通过 `/// <reference types="vite/client" />` 加载静态资源声明，供 TypeScript 识别 CSS 等导入。UI 包的普通 `tsconfig.json` 显式包含 `.storybook/**/*.ts` 和 `.storybook/**/*.tsx`：仅设置 `include: ["."]` 会漏掉隐藏目录中的配置及声明文件，导致编辑器提示 CSS 副作用导入缺少类型。发布构建仍仅包含 `src`，不加载这些开发环境声明。

全局启用 `autodocs` 和 Controls，使用 `fullscreen` 布局，把工具区和居中内容区交给独立的 `PreviewFrame`。`preview.tsx` 仅登记配置，`decorators/with-theme.tsx` 组合现有 `ThemeProvider` 与预览布局，`components/preview-frame.tsx` 渲染工具区的真实 `ThemeToggle` 和 story 内容，配套 CSS 仅负责布局。

主题类名、状态、切换事件和持久化全部复用组件库，不在 Storybook 中维护第二套主题逻辑。通信就绪前以默认深色为后备，使用 `bad-ui:storybook:theme` 存储预览偏好，避免覆盖应用的主题选择；首次收到外围主题时保留已有的有效预览偏好；外围后续变化时再以外围值为准。背景跟随 UI 的 body 样式，关闭独立的 backgrounds 控件以避免混淆。

Docs 的 `parameters.docs.story.inline` 设置为 `false`，每个示例在独立 iframe 内运行，避免多个 Provider 争用同一个 HTML 根节点；预览高度为 240px。外围工具栏通过 channel 发送 `theme/events.ts` 中的专用 `MANAGER_THEME_CHANGED` 事件，`sync-manager-theme.tsx` 接收后调用现有 Provider 的 `setTheme`。不用 `updateGlobals`：该 API 会触发 Storybook 的 Docs 重新渲染流程，可能带来示例重建和 loading。主题切换只更新 Provider 状态及容器配色，不请求 Storybook 重新渲染文档。首次广播带 `initial` 标记，不覆盖已恢复的预览独立偏好。

同步规则：首次挂载优先保留 Provider 已读取的有效预览偏好，没有有效保存值时跟随外围；外围切换后，预览再次跟随。预览区 ThemeToggle 可单独改变预览主题，不反向修改外围。发送端和接收端均使用 `useLayoutEffect`，尽量在绘制前发送主题并更新 Provider，减少旧配色闪动；跨 iframe 通信仍是异步的，不保证两个文档同一帧完成更新。同步 Effect 只依赖外围值和稳定的 `setTheme`，不依赖预览当前主题，因此单独切换不会被立即覆盖。重新挂载示例（包括刷新、新建 Docs iframe）时优先恢复已保存的预览偏好；普通 Controls 重渲染不应重置本地选择。

Docs 正文的主题入口为 `parameters.docs.container`，使用 `components/themed-docs-container.tsx`。该组件保留官方 `DocsContainer`，通过 Docs context 的 channel 订阅专用主题事件，仅更新本地 React 状态并传入 `themes.dark` 或 `themes.light`。同时将该事件转发给 `theme/docs-channel.ts` 创建的桥接 channel。首次读取外围存储偏好，不再依赖 `GLOBALS_UPDATED`。Docs 正文始终跟随外围；内部示例 iframe 的 ThemeToggle 只控制对应示例，不改动 Docs 正文。

Docs 中 `inline: false` 的示例是嵌套 iframe，不能依赖顶层 channel 自动覆盖。`theme/docs-channel.ts` 使用 Storybook `Channel` 和专用 postMessage 传输层连接 Docs 与嵌套示例，校验同源、发送窗口以及允许的事件类型。示例挂载后发送 `PREVIEW_THEME_READY`，Docs 通过 channel 回复当前主题并标记 `initial`，保留已保存的预览独立偏好；后续真正的外围切换则覆盖预览。监听器在卸载时清理，iframe 的地址和 React key 不因主题变化而改变。

职责统一为 channel 通知、localStorage 保存。Storybook 主题同步不再监听 `storage` 事件，存储失败也不阻止当前页面的 channel 通知；刷新恢复仍依赖能否成功保存。组件库 ThemeProvider 自身的跨标签页同步功能保持原样。

Docs 容器将当前主题写入自身文档的 `data-storybook-docs-theme`，同时设置 `color-scheme`，让原生滚动条和表单控件匹配配色。`components/docs-scrollbar.css` 仅在 Docs 暗色模式下设置深灰轨道和灰色滑块，包含 WebKit 回退；浅色模式及高对比度模式保留系统样式。退出 Docs 时恢复原属性，不影响独立示例 iframe 的主题。

刷新 Docs 时，Storybook 会先显示 `.sb-preparing-docs` 中的预览卡片和 Props 表格骨架。`preview-head.html` 对这些静态节点添加暗色覆盖，包括预览背景、表格单元格、边框、图标和文字占位块。选择器限定在初始 loading 遮罩中，加载完成后的组件及文档样式不受影响。

### 编写组件示例

采用 CSF 3，通过 `Meta`、`StoryObj` 与 `satisfies` 检查类型，从 `@storybook/react-vite` 导入类型。story 文件使用 PascalCase，与现有小写组件文件相邻；不要从组件库入口导出 stories。

| 文件                | 已包含的场景               |
| ------------------- | -------------------------- |
| `Input.stories.tsx` | 默认、禁用、只读、错误、可见标签、辅助说明、受控、非受控初始值、必填、长度限制、邮箱、密码、数值，共 13 个场景 |

当前仅保留 Input 示例，作为后续组件的详细参考；Button 和 ThemeToggle 的组件实现仍保留，暂不提供对应 stories。Input 有可访问名称，错误提示通过 `aria-describedby` 关联，四类事件使用 `storybook/test` 的 `fn()` 记录。`argTypes` 按基本属性、值管理、状态、校验、无障碍和事件分组，提供中文说明。

`packages/ui/src/docs/input.mdx` 在侧边栏 **Documentation → Input Guide** 展示完整使用指南，组合可见标签、辅助说明、受控输入及错误示例，解释属性透传、原生校验与测试边界。示例中的 `label` 使用原生 HTML，本包尚未提供独立的 Field / Label 组件。

新增组件时按实际需求选择关键场景即可，不必复制 Input 的所有属性和测试。涉及状态的 React 示例组件定义在模块顶层，避免在普通回调中调用 Hooks 或因重新定义组件导致状态重置。

### 隔离发布构建与检查范围

stories 放在 `src` 后，需要同时修改两处发布构建配置：

1. `tsconfig.build.json` 排除 `src/**/*.stories.ts` 和 `src/**/*.stories.tsx`。
2. `rollup.config.mjs` 的声明入口扫描过滤 `.stories.ts`、`.stories.tsx`；仅修改 tsconfig 不会过滤显式列出的 Rollup 入口。

普通 `tsconfig.json` 保留 stories 和 `.storybook` 的类型检查，排除生成的 `storybook-static`。ESLint 和 Git 同样忽略静态输出目录。`package.json` 的 `files` 保持只发布 `dist`。

### 启动和构建

UI 包新增两个 scripts：

```json
{
  "storybook": "storybook dev -p 6006 --no-open",
  "build-storybook": "storybook build"
}
```

从仓库根目录运行：

```bash
pnpm --filter @badnpm/ui storybook
```

打开 `http://localhost:6006`，查看 Components 下的 Input。调整 Controls、预览区的主题切换按钮，检查 a11y 面板，修改组件源码确认热更新。

生成静态文档：

```bash
pnpm --filter @badnpm/ui build-storybook
```

输出位于 `packages/ui/storybook-static`，可部署到静态服务器。预览产物需要 HTTP 服务，不能直接双击 HTML；部署到子路径时需另外验证资源路径。

Turbo 已登记 `storybook`（常驻、禁用缓存）与 `build-storybook`（缓存输出 `storybook-static/**`），也可运行 `pnpm exec turbo run storybook --filter=@badnpm/ui`。

### 验证基础集成

```bash
pnpm --filter @badnpm/ui typecheck
pnpm --filter @badnpm/ui lint
pnpm --filter @badnpm/ui build-storybook
pnpm --filter @badnpm/ui build
```

检查静态预览中的字体和资源能通过 HTTP 正常加载，发布包中没有 story 的 JS 或声明文件。Vite 构建可能提示依赖中的 `use client` 指令被忽略；Storybook 是浏览器预览，不以此替代组件库发布构建。

## 在 bad-ui 项目中接入测试

本节按照 Storybook Testing 引导清单的顺序记录本项目的测试接入过程。已接入的模块记录实际依赖、配置和验证状态；其余模块保留入口，后续逐项补充。

目前已有组件预览、自动文档和 a11y 面板，并已安装 Vitest 插件及浏览器测试依赖、生成测试配置，添加组件测试运行命令。Input 的 13 个场景已在 Chromium 中通过测试，含交互断言和已启用的无障碍检查。视觉测试、覆盖率报告和 CI 流程尚未接入。上文通用测试章节不能直接当作本仓库已经启用的能力。

### 安装 Vitest 插件（Install Vitest addon）

#### 执行安装向导

在 `packages/ui` 目录执行：

```sh
pnpm exec storybook add @storybook/addon-vitest@10.6.6
```

- **`pnpm exec`**：使用当前项目安装的 Storybook CLI 执行命令。
- **`storybook add`**：安装并注册插件，同时执行插件的接入向导；不仅仅是添加 npm 依赖。
- **`@storybook/addon-vitest@10.6.6`**：请求安装指定版本的官方 Vitest 插件。实际结果需核对 `package.json` 和 `pnpm-lock.yaml`，不能仅凭命令认定安装版本。
- **执行目录**：选择 UI 包目录，让向导识别该包的 `.storybook`，将依赖和配置写入 UI 包。

向导会检查现有测试环境，按需安装 Vitest、浏览器驱动和覆盖率支持，并生成配置。如果提示安装 Playwright 浏览器，选择 **Yes**；浏览器二进制与 npm 中的 `playwright` 包是不同的安装内容。仅存在 npm 依赖，不代表 Chromium 已下载成功。

#### 新增依赖及作用

以下为本次安装后 `pnpm-lock.yaml` 中记录的实际版本，均对应 UI 包的开发依赖：

- **`@storybook/addon-vitest`：`10.6.7`**
  - 将 Storybook 与 Vitest 连接，在 Storybook 中提供测试运行入口和结果展示。
  - 提供 `storybookTest` Vite 插件，将配置中扫描到的 stories 转换为组件测试。
- **`vitest`：`5.1.0`**
  - 负责发现、调度和运行测试，收集断言结果，并支持命令行及监听模式。
- **`@vitest/browser-playwright`：`5.1.0`**
  - 为 Vitest Browser Mode 提供 Playwright 适配，让测试运行在真实浏览器中。
- **`playwright`：`1.65.0`**
  - 启动和控制测试浏览器；本项目生成的配置使用 Chromium。
  - **npm 包位置**：由 pnpm 安装在项目中，通过 `packages/ui/node_modules/playwright` 访问；该入口通常是指向 pnpm 管理位置的符号链接。
  - **浏览器本体位置**：默认下载到电脑的用户缓存目录，不在项目的 `node_modules` 中。macOS 通常为 `~/Library/Caches/ms-playwright`，可供多个项目复用。
  - **自定义位置**：设置 `PLAYWRIGHT_BROWSERS_PATH` 可更改浏览器存放位置；安装与运行测试时应使用一致的配置。
- **`@vitest/coverage-v8`：`5.1.0`**
  - 为 Vitest 提供基于 V8 的代码覆盖率采集支持。
  - 安装依赖不等于已生成报告；报告命令及配置留到“生成测试覆盖率报告”模块记录。

这些依赖服务于组件库开发与测试，不要求 npm 包使用者手动安装。
本次向导将 Vitest、浏览器适配、覆盖率和 Playwright 的版本声明写为 `latest`；上述具体版本来自 lockfile，并非该声明永远解析出的版本。

#### 新增及修改的配置

- **`packages/ui/.storybook/main.ts`**
  - `addons` 中增加 `@storybook/addon-vitest`，保留 Docs 和 a11y 插件，使 Storybook 加载测试插件。
- **`packages/ui/vitest.config.ts`**
  - 通过 `defineConfig` 声明测试配置，使用 `test.projects` 定义名为 `storybook` 的测试项目。
  - `storybookTest({ configDir: ... })` 指向 UI 包的 `.storybook`，根据现有 stories 和预览配置建立测试环境。
  - `browser.enabled: true` 启用浏览器模式，`provider: playwright({})` 指定浏览器驱动。
  - `instances: [{ browser: 'chromium' }]` 选择 Chromium，`headless: true` 表示运行时不弹出浏览器窗口。
  - 本次未生成独立的 `.storybook/vitest.setup.ts`，当前配置也未引用该文件，无需照搬前文通用示例额外创建。
- **`packages/ui/vitest.shims.d.ts`**
  - 引用 `@vitest/browser-playwright` 的类型声明，供 TypeScript 识别浏览器测试相关类型；它不执行测试。
- **`packages/ui/.storybook/preview.tsx`**
  - 安装向导初始增加 `parameters.a11y.test: 'todo'`：无障碍问题作为待处理项展示，不作为阻断测试的门禁。
  - 后续“运行无障碍测试”模块已将其改为 `error`，发现违规时让测试失败。
- **`packages/ui/package.json` 与 `pnpm-lock.yaml`**
  - 分别记录依赖声明和实际解析版本；安装向导未新增测试 script，运行命令在下一模块中添加。

#### 当前状态与待验证项

- **已确认**：依赖已安装，插件已注册，Vitest 浏览器配置已生成。
- **版本差异**：虽然本节记录的命令指定 `10.6.6`，实际插件为 `10.6.7`，其 `peerDependencies.storybook` 要求 `^10.6.7`；当前 lockfile 中的 Storybook 为 `10.6.6`，不满足此要求。运行测试前需对齐兼容版本，本文暂不将其标记为验证通过。
- **浏览器状态**：后续已成功使用 Chromium 运行 13 个 Input 场景，确认本机测试浏览器可用；换机器时仍需安装对应浏览器。
- **下一模块**：对齐版本后，运行现有 stories 的组件测试，记录执行命令和实际结果。后续再逐项补充交互、无障碍、视觉、覆盖率和 CI。

官方参考：[Vitest 插件接入说明](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/index)。

### 运行组件测试（Test your components）

#### 添加运行命令

在 `packages/ui/package.json` 的 `scripts` 中添加：

```json
{
  "test-storybook": "vitest run --project=storybook",
  "test-storybook:watch": "vitest --project=storybook"
}
```

- **`test-storybook`**：运行一次测试后退出，适合手动验证和后续 CI；测试失败时返回非零退出码。
- **`test-storybook:watch`**：以监听模式运行，组件和 stories 修改后重新执行相关测试。
- **`--project=storybook`**：选择 `vitest.config.ts` 中名为 `storybook` 的测试项目。

在 `packages/ui` 目录执行：

```sh
pnpm test-storybook
```

开发时可改为执行 `pnpm test-storybook:watch`。在仓库根目录执行时，需要加包筛选：

```sh
pnpm --filter @badnpm/ui test-storybook
```

#### 测试代码从哪里来

- 上一步生成的 `vitest.config.ts` 已注册 `storybookTest`，它会根据 `.storybook/main.ts` 扫描现有 stories，并将它们转换为组件测试。
- 现有 `Input.stories.tsx` 中的 Default、Disabled、ReadOnly、Invalid 就是基础测试场景，无需为本阶段重复创建 `.test.tsx` 文件。
- 在尚未编写 `play` 时，主要验证各场景能否正常渲染；渲染成功不代表禁用、只读等行为已经通过断言验证。下一模块在这些 stories 中补充行为断言。
- `onChange: fn()` 等配置只提供回调记录能力；需要编写操作和断言，才能验证回调是否按预期触发，具体留到交互测试模块。

#### 在 Storybook 中运行

- 执行 `pnpm storybook` 启动工作台，在 Vitest 插件提供的测试入口中运行测试、查看结果。
- 单次命令行测试不要求先启动 Storybook 开发服务，也不要求先构建静态站点。

#### 当前状态

- 已添加单次运行和监听模式命令。
- 后续扩展 Input 后已完成浏览器验证：执行 `pnpm --filter @badnpm/ui test-storybook`，结果为 1 个测试文件、13 个测试通过。版本声明仍存在上一模块记录的兼容范围差异；通过本次测试不能代替依赖版本对齐。

### 编写交互测试（Test functionality with interactions）

#### 在 stories 中添加 play

本模块复用已安装的 Vitest 插件，不增加测试依赖，也不新建重复的 `.test.tsx` 文件。测试直接写在 `packages/ui/src/components/Input.stories.tsx` 各个 story 的 `play` 函数中，组件渲染完成后执行。

- **`fn`**：从 `storybook/test` 导入，作为 `onChange`、`onFocus`、`onBlur`、`onKeyDown` 的替身回调，记录调用，供断言检查。
- **`expect`**：从 `storybook/test` 导入，验证输入值、焦点、禁用状态、可访问描述以及回调调用。
- **`canvas`**：由 `play` 上下文提供，通过角色和可访问名称定位当前 story 中的输入框，避免查找其他预览中的元素。
- **`userEvent`**：由 `play` 上下文提供，模拟点击、输入、清空、Enter、Tab 等用户操作。
- **`step`**：由 `play` 上下文提供，把操作和断言分成带中文名称的步骤，在 Interactions 面板中展示。

例如，Default 中验证聚焦的步骤为：

```tsx
import { expect, fn } from 'storybook/test';

// 保留现有 meta、args 和 Story 类型定义。
export const Default: Story = {
  play: async ({ canvas, userEvent, args, step }) => {
    const input = canvas.getByRole('textbox', { name: '示例输入框' });

    await step('点击输入框后获得焦点，并触发 onFocus', async () => {
      await userEvent.click(input);
      await expect(input).toHaveFocus();
      await expect(args.onFocus).toHaveBeenCalled();
    });
  },
};
```

这段代码仅展示聚焦步骤，完整实现见 `Input.stories.tsx`。操作、断言和步骤均使用 `await`，便于依序执行并在面板中追踪失败位置。

#### 本次覆盖的场景

- **Default**
  - 点击后获得焦点，并触发 `onFocus`。
  - 输入后值更新，并触发 `onChange`；清空后值为空。
  - 按 Enter 后，`onKeyDown` 收到 `key: 'Enter'` 的事件。
  - 按 Tab 后离开输入框，并触发 `onBlur`。
- **Disabled**
  - 输入框具有禁用状态，尝试输入后值仍为空，且未获得焦点。
  - 不触发 `onChange` 和 `onFocus`。
  - 禁用样式包含 `pointer-events: none`，使用 `type` 的 `skipClick` 选项跳过点击，避免测试工具将不可点击样式当作交互错误。
- **ReadOnly**
  - 可以点击聚焦，且触发 `onFocus`。
  - 输入文字、按 Backspace 后仍保留原值，不触发 `onChange`。
- **Invalid**
  - 输入框处于无效状态，错误提示可见，且通过 `aria-describedby` 成为可访问描述。
  - 仍可输入文字并触发 `onChange`。
  - 输入后继续保留错误状态：`aria-invalid` 由调用方传入，Input 不负责自动校验或清除错误。

#### 运行与查看结果

在 `packages/ui` 目录执行：

```sh
pnpm test-storybook
```

- Vitest 会在执行 stories 时运行新增的 `play`，无需另外增加交互测试命令。
- 执行 `pnpm storybook` 后，打开具体 story 的 **Interactions** 面板，可查看各步骤、操作和断言。
- **Actions** 展示回调调用日志；**Interactions** 展示行为断言结果。看到事件日志不等于测试通过。
- `play` 会自动操作预览，因此输入框可能显示测试结束时的内容；可通过重新挂载 story 重新执行流程。

#### 验证状态

- `pnpm --filter @badnpm/ui typecheck`：通过。
- 首次浏览器测试曾因沙箱监听端口权限受限而无法启动；后续在获准的沙箱外运行中，全部 13 个 Input 测试通过，包含新增的交互场景。
- 当前场景已扩展为完整的 13 项清单，见 Storybook 的 **Documentation → Input Guide**；源码保留 API 中文注释。Storybook / 插件版本兼容范围差异仍需对齐。

官方参考：[交互测试](https://storybook.js.org/docs/writing-tests/interaction-testing)。

### 运行无障碍测试（Run accessibility tests）

#### 复用现有插件

本模块无需安装新依赖，也无需在每个 story 中手动调用扫描函数：

- **`@storybook/addon-a11y`**：已在 `.storybook/main.ts` 的 `addons` 中注册，使用 axe-core 检查渲染后的 DOM，并在 Accessibility 面板展示结果。
- **`@storybook/addon-vitest`**：将无障碍检查接入现有组件测试流程，复用 Vitest 的浏览器环境。
- **现有 stories**：为扫描提供默认、禁用、只读、错误等场景；新增组件 story 后也会继承全局配置。

#### 配置失败策略

在 `packages/ui/.storybook/preview.tsx` 的全局 `parameters` 中，将安装向导生成的 `todo` 改为 `error`：

```ts
parameters: {
  a11y: {
    // 自动检查发现违规时，让本地和 CI 中的组件测试失败。
    test: 'error',
  },
},
```

- **`error`**：运行检查，发现违规时报告测试失败。本项目采用此策略。
- **`todo`**：运行检查，在 Storybook 中将违规显示为待处理警告，不阻断命令行或 CI。
- **`off`**：跳过自动检查，仍可通过插件面板手动检查。

当前沿用插件默认规则，不额外收窄检查范围、不关闭单条规则。组件或单个 story 的 `parameters.a11y` 可以覆盖全局设置；如确需临时改为 `todo`，应在对应代码旁说明原因和待修复问题。

#### 执行与查看结果

在 `packages/ui` 目录中复用已有命令：

```sh
pnpm test-storybook
```

- **命令行**：执行组件测试及已启用的无障碍检查；发现违规时测试失败并返回非零退出码。无需另建 `test-a11y` 命令。
- **开发监听**：执行 `pnpm test-storybook:watch`，修改组件或 stories 后重新检查。
- **Storybook 工作台**：执行 `pnpm storybook`，展开侧边栏测试控件，勾选 **Accessibility**，再点击 **Run component tests**。
- **定位问题**：打开具体 story 的 **Accessibility** 面板，查看违规规则、受影响节点和修复建议。
- **后续 CI**：接入相同测试命令即可复用失败策略；本模块没有创建 CI 工作流。

面板结果需要区分：

- **Violations**：自动检查发现的违规，需要修复。
- **Passes**：通过的检查项。
- **Incomplete**：工具无法确定，需要人工判断；不能当作通过，也不等同于已确认违规。

#### Input 的检查范围

- `aria-label` 为输入框提供可访问名称。
- 错误场景通过 `aria-invalid` 标记状态，并用 `aria-describedby` 关联提示。
- axe-core 自动检查适用的无障碍规则，包括标签、ARIA 和颜色对比度等；实际检查结果以浏览器报告为准。
- 上一模块的 `play` 断言继续验证焦点和键盘行为。自动扫描不能替代 Tab 顺序、屏幕阅读器等人工验证，也不保证所有主题和交互中间状态都被覆盖。

#### 验证状态

- 已将全局失败策略切换为 `error`，并保留原有主题、样式和交互测试配置。
- `pnpm --filter @badnpm/ui typecheck` 与 `.storybook/preview.tsx` 的 ESLint 检查均通过。
- 后续 Chromium 验证通过：全局 `a11y.test: 'error'` 开启时，13 个 Input 测试均通过；未关闭规则或为单个 story 降级策略。结果只覆盖本次测试环境和场景，不代表全部主题及辅助技术均已人工验证。Storybook 与 Vitest 插件的版本差异仍需处理。

官方参考：[无障碍测试接入与失败策略](https://storybook.js.org/docs/writing-tests/accessibility-testing)。

### 安装视觉测试插件（Install Visual Tests addon）

- 接入步骤：待补充。

### 运行视觉测试（Run visual tests）

- 接入步骤：待补充。

### 生成测试覆盖率报告（Generate a coverage report）

- 接入步骤：待补充。

### 在 CI 中自动运行测试（Automate tests in CI）

- 接入步骤：待补充。
