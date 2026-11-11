import { useLayoutEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { DocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks';
import { themes } from 'storybook/theming';
import { readManagerTheme } from '../manager/theme-storage';
import { MANAGER_THEME_CHANGED, PREVIEW_THEME_READY, type ManagerThemeMessage } from '../theme/events';
import { createDocsThemeChannel } from '../theme/docs-channel';
import './docs-scrollbar.css';

/** Docs 正文使用独立主题，明确订阅外围主题，不受示例 iframe 的独立切换影响。 */
export function ThemedDocsContainer({ children, context }: PropsWithChildren<DocsContainerProps>) {
  const [theme, setTheme] = useState(readManagerTheme);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.storybookDocsTheme;
    const previousColorScheme = root.style.colorScheme;
    // Docs 自己的主题标记独立于组件 Provider；原生滚动条与表单控件也跟随配色。
    root.dataset.storybookDocsTheme = theme;
    root.style.colorScheme = theme;
    return () => {
      if (previousTheme === undefined) delete root.dataset.storybookDocsTheme;
      else root.dataset.storybookDocsTheme = previousTheme;
      root.style.colorScheme = previousColorScheme;
    };
  }, [theme]);
  useLayoutEffect(() => {
    const bridge = createDocsThemeChannel('docs');
    let currentTheme = readManagerTheme();
    const handleTheme = (message: ManagerThemeMessage) => {
      if (message.theme !== 'light' && message.theme !== 'dark') return;
      currentTheme = message.theme;
      setTheme(message.theme);
      // 将外围事件显式转发到 Docs 的嵌套示例，不重建 iframe。
      bridge.channel.emit(MANAGER_THEME_CHANGED, message);
    };
    const handleReady = () => {
      bridge.channel.emit(MANAGER_THEME_CHANGED, { theme: currentTheme, initial: true });
    };
    // 只更新官方容器的 theme prop，保留文档内容和示例 iframe，不要求 Storybook 重绘 Docs。
    context.channel.on(MANAGER_THEME_CHANGED, handleTheme);
    bridge.channel.on(PREVIEW_THEME_READY, handleReady);
    return () => {
      context.channel.off(MANAGER_THEME_CHANGED, handleTheme);
      bridge.dispose();
    };
  }, [context]);

  return (
    // 保留官方 DocsContainer 的上下文和布局，仅提供动态主题。
    <DocsContainer context={context} theme={theme === 'dark' ? themes.dark : themes.light}>
      {children}
    </DocsContainer>
  );
}
