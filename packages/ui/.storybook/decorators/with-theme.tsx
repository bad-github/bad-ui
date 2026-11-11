import type { Decorator } from '@storybook/react-vite';
import { ThemeProvider } from '../../src/providers/theme-provider';
import { PreviewFrame } from '../components/preview-frame';
import { SyncManagerTheme } from './sync-manager-theme';
import { themeStorageKeys } from '../theme/storage-keys';
import { readManagerTheme } from '../manager/theme-storage';

// 只组合现有主题能力，不在 Storybook 中重复实现主题类名或切换事件。
export const withTheme: Decorator = (Story) => {
  return (
    <ThemeProvider
      // 无预览偏好时使用外围保存值，不依赖 Storybook globals。
      defaultTheme={readManagerTheme()}
      // 刷新优先恢复预览自己的偏好；后续外围主题变化时再跟随并保存。
      storageKey={themeStorageKeys.preview}
    >
      <SyncManagerTheme />
      <PreviewFrame>
        <Story />
      </PreviewFrame>
    </ThemeProvider>
  );
};
