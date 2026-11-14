# 发布 Storybook 到 Vercel / Cloudflare Pages

Storybook 构建产物为 `packages/ui/storybook-static`，用于浏览组件和文档。npm 包发布步骤见 [npm 发布指南](./npm-publishing.md)。以下配置均以仓库根目录为基准，两个平台可以同时关联同一个 GitHub 仓库。

## 本地检查

使用 Node.js 24 和根 `package.json` 指定的 pnpm 版本，在仓库根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm --filter @badnpm/ui exec playwright install chromium
pnpm --filter @badnpm/ui typecheck
pnpm --filter @badnpm/ui lint
CI=true pnpm --filter @badnpm/ui test-storybook:coverage
pnpm --filter @badnpm/ui build-storybook
pnpm --filter @badnpm/ui preview-storybook
```

`CI=true` 仅为本次命令及其子进程设置环境变量，供 pnpm、Vitest 等工具识别持续集成环境，使本地检查更接近 GitHub Actions（例如采用非交互行为）。项目源码未直接读取 `CI`；它不负责开启覆盖率、交互测试或无头浏览器：这些分别由 `--coverage`、测试模式和 `headless: true` 配置控制。本地不加也能运行。

上述命令检查类型、lint、交互测试和覆盖率，并构建 Storybook。任一步失败，应先修复再继续或推送。预览服务默认端口 6007，不会重新构建；修改代码后需重新构建。

## Vercel

1. 在 Vercel 导入 GitHub 仓库 `bad-github/bad-ui`；已有项目则打开其 Settings 核对下表。
2. 配置 Git 生产分支为 `main`，保存构建设置并部署。

| 设置 | 值 |
| --- | --- |
| Framework Preset | Other |
| Root Directory | 仓库根目录，不设为 `packages/ui` |
| Node.js | 24.x |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm --filter @badnpm/ui build-storybook` |
| Output Directory | `packages/ui/storybook-static` |

部署后记录实际地址；仓库之前展示的地址为 https://bad-ui-kappa.vercel.app，当前可用性和绑定以 Vercel 控制台为准。

## Cloudflare Pages

这里使用 **Pages 静态站点**流程。若控制台进入 Workers 创建页面，应切换到 Pages。

1. 在 Workers & Pages 中创建 Pages 项目，选择连接 Git，授权并选择 `bad-github/bad-ui`。
2. 生产分支选择 `main`，填写构建配置：

| 设置 | 值 |
| --- | --- |
| Framework preset | None |
| Root directory | 仓库根目录（留空） |
| Build command | `pnpm install --frozen-lockfile && pnpm --filter @badnpm/ui build-storybook` |
| Build output directory | `packages/ui/storybook-static` |
| 环境变量 `NODE_VERSION` | `24` |
| 环境变量 `PNPM_VERSION` | 与根 `package.json` 的 `packageManager` 一致，目前为 `11.25.0` |
| 环境变量 `SKIP_DEPENDENCY_INSTALL` | `true`，由上方构建命令显式安装依赖 |

3. 保存并部署，记录分配的 `pages.dev` 地址。需要自定义域名时在项目的 Custom domains 中添加。

Cloudflare 的线上项目和域名尚未在本次文档更新中核实；上表是此仓库的接入配置。

## 每次更新

1. 更新源码、Stories 和文档，执行上方“本地检查”中的命令，并预览静态产物。
2. 提交并推送到 GitHub 的 `main`。
3. 两个平台启用 Git 自动部署后，会分别构建生产站点；其他分支是否生成预览由平台项目设置控制。
4. 分别检查 Vercel / Cloudflare 的部署日志和部署对应的提交 SHA，成功后检查线上地址。

平台的 Git 部署与 GitHub Actions 的 UI checks 独立运行。当前 `storybook-tests.yml` 只检查和构建，不负责上传站点；若需要检查通过后才上线，还需另外配置部署门禁。部署 Storybook 不需要创建 Release 或修改 npm 版本。

## 交互与上线验收

普通预览默认关闭自动交互。需要开启时，在平台构建环境设置 `VITE_STORYBOOK_INTERACTIONS=true` 并重新部署；设为 `false` 或不配置则关闭。测试模式始终执行交互。

检查文档与组件菜单、刷新、字体图片、深浅主题、窄屏布局和手动交互。不要用开发服务器代替静态产物验收。默认按网站根路径部署；使用子路径需额外验证资源路径。

- **找不到输出目录**：核对 Root Directory、构建命令与输出路径，避免路径重复。
- **pnpm / 依赖安装失败**：核对 Node、pnpm 版本和锁文件；在平台日志确认实际使用的版本。
- **线上仍是旧文档**：核对分支、部署 SHA 和生产域名指向，重新部署包含修改的提交。
- **UI checks 失败但站点已上线**：这是两条独立流水线，修复测试并更新部署，按需配置门禁。

参考：[Vercel 构建配置](https://vercel.com/docs/builds/configure-a-build)、[Cloudflare Pages 构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/)、[Cloudflare 构建环境](https://developers.cloudflare.com/pages/configuration/build-image/)。
