# 发布 Storybook 到 Vercel / Cloudflare Workers

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

Vercel 已部署，地址为 https://bad-ui-kappa.vercel.app，并已关联 GitHub 自动部署；后续推送代码会触发构建，具体分支规则以项目设置为准。

## Cloudflare Workers Static Assets

使用新版 Workers Git 部署流程。仓库根目录的 `wrangler.jsonc` 指定 Worker 名称 `bad-ui`、兼容日期以及静态资源目录 `./packages/ui/storybook-static`。纯静态站点无需 Worker 入口代码，部署和预览共用此资源配置。

1. 在 Cloudflare 点击 Create app → Continue with GitHub，选择 `bad-github/bad-ui`。
2. 在“设置您的应用程序”中填写：

| 设置 | 值 |
| --- | --- |
| 项目名称 | `bad-ui`，与 `wrangler.jsonc` 的 name 一致 |
| 生产分支 | `main` |
| Root directory | 仓库根目录（留空） |
| 构建命令 | `pnpm --filter @badnpm/ui build-storybook` |
| 部署命令 | `npx wrangler deploy` |
| 预览命令 | `npx wrangler preview` |

Workers Builds 安装依赖后执行构建，再执行部署命令；无需单独填写输出目录，资源路径从 `wrangler.jsonc` 读取。项目构建环境使用 Node.js 24，pnpm 版本与根 `package.json` 的 `packageManager` 一致（目前 `11.25.0`）；在构建日志核对实际版本，必要时通过构建环境变量 `NODE_VERSION`、`PNPM_VERSION` 指定。

预览命令用于启用预览构建后的非生产分支，生成预览站点，不替换 main 的正式部署。它不是启动本地开发服务器。若 Wrangler 提示找不到 preview 命令，应检查使用的 Wrangler 版本，新版流程需要支持 Previews 的版本。

3. **先提交并推送 `wrangler.jsonc` 和要发布的源码，再点击部署**，否则远端无法读取本地配置。
4. 在部署日志确认 Storybook 构建及静态资源上传成功，记录实际 `workers.dev` 地址。后续在项目 Settings → Build 中调整 Git 分支、构建和部署设置。

Cloudflare 的线上部署结果以实际日志与站点验收为准；本配置文件不表示已部署成功。

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

参考：[Vercel 构建配置](https://vercel.com/docs/builds/configure-a-build)、[Workers 构建配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)、[Workers 静态资源](https://developers.cloudflare.com/workers/static-assets/)。
