// manager 的构建流程独立于 Vite 预览区，这里的 JSX 按经典模式编译。
// 例如 <ManagerThemeTool /> 会变为 React.createElement(ManagerThemeTool)。
// 因此必须显式导入 React 运行时变量，否则浏览器会报 React is not defined。
// 即使按钮仅显示文字，没有使用任何图标库，JSX 仍然需要此导入。
import * as React from 'react';
import { IconButton } from 'storybook/internal/components';
import { addons, types, useStorybookApi } from 'storybook/manager-api';
import { styled, useTheme } from 'storybook/theming';
import { managerThemes } from './theme-config';
import { saveManagerTheme } from './theme-storage';
import { MANAGER_THEME_CHANGED } from '../theme/events';

const addonId = 'bad-ui/manager-theme';

// 使用 manager 自带的样式工具定义伪类；提高优先级以覆盖 IconButton 默认 hover 配色。
const ThemeToolButton = styled(IconButton)({
  // 普通状态样式直接写在对象顶层；文字按钮需要比单个图标更宽的空间。
  width: 'auto',
  padding: '0 8px',
  boxShadow: 'none',
  backgroundColor: 'transparent',
  '&&:hover': {
    color: 'rgb(71, 157, 255)',
    backgroundColor: 'rgba(71, 157, 255, 0.14)',
  },
});

/** 外围界面的主题工具，不依赖预览 iframe 中的组件库 Provider。 */
function ManagerThemeTool() {
  // 读取实际生效的 manager 主题，不额外维护一份容易失步的 React 状态。
  const theme = useTheme();
  const api = useStorybookApi();
  const isDark = theme.base === 'dark';
  const announcedTheme = React.useRef<string | undefined>(undefined);
  // 专用事件只更新主题状态，不调用 updateGlobals，避免触发 Docs 整体重绘。
  // 绘制前发送同步消息，减少外围更新到预览接收之间的等待。
  React.useLayoutEffect(() => {
    if (announcedTheme.current === theme.base) return;
    const initial = announcedTheme.current === undefined;
    announcedTheme.current = theme.base;
    addons.getChannel().emit(MANAGER_THEME_CHANGED, { theme: theme.base, initial });
  }, [theme.base]);

  const label = isDark ? '将 Storybook 界面切换为浅色' : '将 Storybook 界面切换为深色';

  return (
    <ThemeToolButton
      // 使用 Storybook 自带按钮外观，title 提供提示，aria-label 提供可访问名称。
      title={label}
      aria-label={label}
      onClick={() => {
        // 更新外围主题；上面的 Effect 随后通知预览中的 Provider 跟随。
        const nextTheme = isDark ? 'light' : 'dark';
        saveManagerTheme(nextTheme);
        api.setOptions({ theme: managerThemes[nextTheme] });
      }}
    >
      {/* 文字显示当前主题；悬停提示和可访问名称说明点击后的切换目标。 */}
      {isDark ? 'dark' : 'light'}
    </ThemeToolButton>
  );
}

// 辅助文件不会被自动识别，由 manager.ts 显式调用注册函数。
export function registerManagerThemeTool() {
  addons.register(addonId, () => {
    addons.add(`${addonId}/tool`, {
      // 工具的注册名称，供 Storybook 管理和识别此工具。
      title: 'Storybook 界面主题',
      // TOOL 表示挂载到顶部工具栏，而不是下方的插件面板。
      type: types.TOOL,
      // Canvas 与 Docs 页面均显示；只修改外围界面，不修改 Docs 正文主题。
      match: ({ viewMode }) => viewMode === 'story' || viewMode === 'docs',
      // 将 Hook 放在独立 React 组件中，通过 render 挂载。
      render: () => <ManagerThemeTool />,
    });
  });
}
