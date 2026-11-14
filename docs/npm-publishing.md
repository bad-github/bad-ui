# npm 自动发布

目标包：`@badnpm/ui`。源代码：<https://github.com/bad-github/bad-ui>，包目录：`packages/ui`。

## 一次性配置

1. 将 `.github/workflows/publish.yml`、组件包的 `package.json` 和相关改动提交并推送到 `main`。确认仓库 Settings → Actions → General 允许工作流运行及所用 Actions。
2. 使用拥有 `@badnpm/ui` 发布权限的 npm 账号登录 npm 网站。包已存在，无需重复做首次手动发布。
3. 打开 <https://www.npmjs.com/package/@badnpm/ui/access>，在包设置中找到 Trusted publishing，新增 GitHub Actions 发布者：

   | 字段 | 值 |
   | --- | --- |
   | Organization or user | `bad-github` |
   | Repository | `bad-ui` |
   | Workflow filename | `publish.yml` |
   | Environment name | 留空，本工作流没有使用 environment |
   | Allowed actions | 允许直接 `npm publish`，不能只允许 staged publishing |

4. 保存。无需在 GitHub Secrets 中创建 `NPM_TOKEN`。如果 npm 提示新配置有验证有效期，按提示及时完成首次自动发布；当前官方文档要求新配置在 2 天内首次成功发布，过期后需重新创建。

工作流名与路径是身份配置的一部分；以后改文件名需同步重新配置 npm 的 Trusted Publisher。GitHub 用户名与 npm 用户名独立，`bad-github` 是 GitHub 所有者，`@badnpm` 是 npm scope。

## 每次发布

1. 本次 `packages/ui/package.json` 的版本已设置为 `0.0.1`，对应 Release 标签为 `v0.0.1`；无需修改根包版本。`0.0.0` 已在 npm 存在，不能重复发布。后续发版时，先将组件包版本改为尚未发布的正式版本，并同步更新日志及 Release 标签。
2. 更新发布日志，检查本次公开的组件、类型、CSS 和字体。可先运行：

   ```sh
   pnpm --filter @badnpm/ui build
   cd packages/ui
   npm pack --dry-run
   ```

   包入口、CSS、字体资源需要齐全；可用 `npm pack` 生成 tarball 并在消费应用验证，详见 Storybook 的 Development/Publishing。
3. 将版本变更和需要发布的源码提交到 `main`，推送到 GitHub，确认 UI checks 通过。
4. 打开 <https://github.com/bad-github/bad-ui/releases/new>：选择或创建标签 `v0.0.1`，Target 选择包含本次源码和工作流的 `main` 提交，填写标题与日志。标签必须是 `v` 加包版本；不要勾选 pre-release。点击 Publish release 后会真实发布到 npm。
5. 在 <https://github.com/bad-github/bad-ui/actions> 查看 Publish npm package。它会检出标签源码，核对版本，安装锁定依赖，执行类型检查、lint、Chromium Storybook 测试、构建和打包预览；全部成功后执行 `npm publish --access public --tag latest`。
6. 完成后验证：

   ```sh
   npm view @badnpm/ui@0.0.1 version --registry=https://registry.npmjs.org/
   npm view @badnpm/ui dist-tags --registry=https://registry.npmjs.org/
   ```

普通 push、PR、草稿 Release 不发布；标记为 pre-release 的 Release 跳过。本工作流目前只发布正式版本到 `latest`，不支持 beta 通道，也不部署 Storybook。

## 失败时

- **标签不匹配**：确认标签中的版本与该标签提交中的 `packages/ui/package.json` 完全一致。
- **认证失败 / E404**：检查 npm 账号对该包的权限，以及 Trusted Publisher 中的所有者、仓库、文件名、有效期和允许的操作；Environment 必须留空。当前配置依赖 GitHub 托管 Runner 的 OIDC，不使用 token。
- **版本已存在 / E403**：先查询 npm。如果该版本已经上传成功，不要再次发布同版本；修改后使用新版本号。
- **检查失败**：修复源码并提交。Release 检出的是标签指向的提交，重跑旧 Release 不会自动包含 main 上的新修复。

参考：[npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)、[npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/)。
