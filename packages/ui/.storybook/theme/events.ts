// 专用主题事件不会触发 Storybook 的 UPDATE_GLOBALS 文档重绘流程。
export const MANAGER_THEME_CHANGED = 'bad-ui/manager-theme-changed';
// 嵌套预览挂载后主动请求当前主题，避免错过挂载前已经发送的通知。
export const PREVIEW_THEME_READY = 'bad-ui/preview-theme-ready';
export type ManagerThemeMessage = { theme?: unknown; initial?: boolean };
