// Storybook 按配置目录中的固定入口名 preview 识别此文件，打包到浏览器预览 iframe 中。
// 导出的全局配置会与组件 meta、单个 story 的配置共同决定最终预览行为。
import type { Preview } from '@storybook/react-vite';
import { withTheme } from './decorators/with-theme';
import { ThemedDocsContainer } from './components/themed-docs-container';
// 加载组件运行后的完整主题、页面配色和字体，保留 Vite 的样式热更新。
import '../src/styles/index.css';
import '../src/styles/custom.css';
import '../src/styles/font/geist.css';

const preview: Preview = {
  // 为所有组件启用自动文档页，组件 meta 可覆盖这些标签。
  tags: ['autodocs'],
  // 复用组件库 Provider 和 ThemeToggle，并接收顶部工具栏发来的外围主题。
  decorators: [withTheme],
  // 控制预览和插件行为，不作为组件 props 传入。
  parameters: {
    // 取消 Storybook 的外层居中容器，由 PreviewFrame 统一安排工具区和内容区。
    layout: 'fullscreen',

    docs: {
      // Docs 正文单独接入外围主题；示例 iframe 仍保留自己的 ThemeProvider。
      container: ThemedDocsContainer,
      story: {
        // 每个 Docs 示例使用独立 iframe，避免多个 Provider 争用同一个 html。
        inline: false,
        // 为预览工具和组件内容预留高度，单位为像素。
        height: 240,
      },
    },

    // 预览背景跟随 UI 的 body 主题，避免独立背景控件与主题冲突。
    backgrounds: { disable: true },

    // 控制属性编辑器的行为，右侧 Controls 面板和 Docs 中的 Controls 表格都会使用。
    controls: {
      // 根据属性名称推断控件类型；具体属性仍可通过 argTypes 显式指定 control。
      matchers: {
        // 名称以 background 或 color 结尾时使用颜色选择器；i 表示忽略大小写。
        color: /(background|color)$/i,
        // 名称以 Date 结尾时使用日期选择器，例如 startDate。
        date: /Date$/i,
      },
    },

    a11y: {
      // addon-a11y 使用 axe-core 检查渲染后的 DOM，由 Vitest 插件接入现有组件测试。
      // error：发现违规就让测试失败，适用于本地命令和后续 CI，不只是面板提示。
      // todo：仍检查，但只在 Storybook 中提示待修复问题，不作为失败门禁。
      // off：跳过自动检查；本项目默认对所有 stories 启用 error，沿用插件默认规则。
      test: 'error',
    },
  },
};

export default preview;
