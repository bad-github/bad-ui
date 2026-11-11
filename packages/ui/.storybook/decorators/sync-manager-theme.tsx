import { useLayoutEffect } from 'react';
import { addons } from 'storybook/preview-api';
import { useTheme } from '../../src/providers/theme-provider';
import { themeStorageKeys } from '../theme/storage-keys';
import { readManagerTheme } from '../manager/theme-storage';
import { MANAGER_THEME_CHANGED, PREVIEW_THEME_READY, type ManagerThemeMessage } from '../theme/events';
import { createDocsThemeChannel } from '../theme/docs-channel';

function hasSavedPreviewTheme() {
  try {
    const saved = localStorage.getItem(themeStorageKeys.preview);
    return saved === 'light' || saved === 'dark' || saved === 'system';
  } catch {
    return false;
  }
}

/** 将外围主题单向应用到现有 Provider；不直接修改 HTML 类名。 */
export function SyncManagerTheme() {
  const { setTheme } = useTheme();

  // 普通 Canvas 使用 Storybook channel；Docs 嵌套示例通过专用桥接 channel 接收转发。
  useLayoutEffect(() => {
    const channel = addons.getChannel();
    const handleTheme = ({ theme, initial }: ManagerThemeMessage) => {
      // 外围首次广播不覆盖预览已恢复的独立选择，实际切换才强制跟随。
      if (initial && hasSavedPreviewTheme()) return;
      if (theme === 'light' || theme === 'dark') setTheme(theme);
    };
    channel.on(MANAGER_THEME_CHANGED, handleTheme);
    const bridge = window.parent !== window.top ? createDocsThemeChannel('preview') : undefined;
    bridge?.channel.on(MANAGER_THEME_CHANGED, handleTheme);
    // 先监听再请求，保证初始响应到达时已有接收者。
    bridge?.channel.emit(PREVIEW_THEME_READY);

    // 首次保留 Provider 已恢复的预览选择；没有有效保存值才对齐外围。
    if (!hasSavedPreviewTheme()) setTheme(readManagerTheme());

    // 不订阅预览当前 theme，因此预览独立切换不会被立即覆盖。
    return () => {
      channel.off(MANAGER_THEME_CHANGED, handleTheme);
      bridge?.dispose();
    };
  }, [setTheme]);

  return null;
}
