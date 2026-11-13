// 测试环境始终执行交互；开发和生产预览仅在环境变量为字符串 true 时启用。
// 本地在 packages/ui/.env.local 配置，修改后重启 Storybook。
// 线上在部署平台配置，修改后重新构建部署。
export const shouldRunInteractions =
  import.meta.env.MODE === 'test' || import.meta.env.VITE_STORYBOOK_INTERACTIONS === 'true';
