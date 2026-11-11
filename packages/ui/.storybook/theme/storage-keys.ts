// 统一管理 Storybook 的持久化键；manager、preview 及首帧脚本共用。
// 改名会使已有记录不再被读取，如需保留历史偏好，应同时迁移旧键。
export const themeStorageKeys = {
  manager: 'bad-ui:storybook:manager-theme',
  preview: 'bad-ui:storybook:theme',
} as const;
