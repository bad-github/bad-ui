import { themeStorageKeys } from '../theme/storage-keys';

// 与组件预览的存储键分开，预览单独切换不会改写外围偏好。
export type ManagerTheme = 'light' | 'dark';

/** 在外围界面初始化前读取；非法值或存储不可用时回退到默认深色。 */
export function readManagerTheme(): ManagerTheme {
  try {
    const saved = localStorage.getItem(themeStorageKeys.manager);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch {
    return 'dark';
  }
}

/** 存储失败不阻止当前页面切换主题。 */
export function saveManagerTheme(theme: ManagerTheme) {
  try {
    localStorage.setItem(themeStorageKeys.manager, theme);
  } catch {
    // 浏览器可能禁止存储；此时仅保留当前会话中的主题状态。
  }
}
