import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { ThemeProvider, useTheme } from './theme-provider';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { prepareProviderEnvironment } from '../../.storybook/testing/provider-environment';
import { dispatchStorageChange, mockStorageFailure, mockSystemColor } from '../../.storybook/testing/provider-mocks';

// 使用专用存储键，不读写应用或 Storybook 工具栏的真实偏好。
const storageKey = 'bad-ui:storybook:demo:theme';

function ThemeControls() {
  // Hook 必须在对应 Provider 内调用；theme 是用户选择，可为 system。
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <section aria-label="深浅主题演示" className="flex flex-col gap-4" style={{ maxWidth: 560, padding: 24 }}>
      <h2>深浅主题</h2>
      <p role="status">当前模式：{theme}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="选择主题">
        <Button onClick={() => setTheme('light')}>浅色</Button>
        <Button onClick={() => setTheme('dark')}>深色</Button>
        <Button onClick={() => setTheme('system')}>跟随系统</Button>
        <Button variant="outline" onClick={toggleTheme}>切换深浅</Button>
      </div>
      <label htmlFor="theme-demo-input">快捷键输入保护示例</label>
      <Input id="theme-demo-input" placeholder="在此输入 d 不会切换主题" />
      <p>Keyboard Shortcut 示例启用 d 快捷键；其他示例仅通过按钮切换。</p>
    </section>
  );
}

function ThemeExample(args: ComponentProps<typeof ThemeProvider>) {
  return <ThemeProvider {...args}><ThemeControls /></ThemeProvider>;
}

const meta = {
  title: 'Providers/ThemeProvider',
  component: ThemeProvider,
  render: (args) => <ThemeExample {...args} />,
  args: { children: null, defaultTheme: 'light', storageKey, disableTransitionOnChange: true },
  parameters: {
    // 全局装饰器据此让示例自己负责 ThemeProvider，不再挂载外围同步组件。
    isolatedThemeProvider: true,
    docs: { description: { component: '管理 light / dark / system，通过 useTheme 读取和修改。示例使用独立存储键；切换会改变预览 iframe 的 html 配色，不改变 Storybook 外围主题。' } },
  },
  argTypes: {
    children: { control: false, description: '需要读取主题的子树；本示例固定为演示面板。' },
    defaultTheme: { control: 'select', options: ['light', 'dark', 'system'], description: '没有有效保存值时使用，默认为 system。' },
    storageKey: { control: false, description: '保存主题的 localStorage 键；本示例固定为独立测试键。' },
    keyboardShortcut: { control: 'text', description: '可选单键快捷键；在输入区域、组合键或重复按键时不触发。' },
    disableTransitionOnChange: { control: 'boolean', description: '切换时短暂关闭全页 CSS transition，默认 true。' },
  },
  // beforeEach 在每个 story 挂载前执行；返回的函数由 Storybook 在卸载时清理现场。
  beforeEach: ({ parameters }) => {
    const cleanup = prepareProviderEnvironment(storageKey, parameters.savedTheme);
    const restoreStorage = parameters.storageFailure ? mockStorageFailure(storageKey, parameters.storageFailure) : undefined;
    // 先撤销故障模拟，再恢复存储，确保清理本身不会抛出模拟异常。
    return () => { restoreStorage?.(); cleanup(); };
  },
} satisfies Meta<typeof ThemeProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, step }) => {
    const root = canvas.getByRole('status').ownerDocument.documentElement;
    await step('切换深浅模式并保存用户选择', async () => {
      // waitFor 等待 Provider 的水合及 Effect 完成，不使用固定时长 sleep。
      await waitFor(() => expect(root).toHaveClass('light'));
      await userEvent.click(canvas.getByRole('button', { name: '深色' }));
      await expect(canvas.getByRole('status')).toHaveTextContent('当前模式：dark');
      await waitFor(() => expect(root).toHaveClass('dark'));
      await expect(localStorage.getItem(storageKey)).toBe('dark');
      await userEvent.click(canvas.getByRole('button', { name: '切换深浅' }));
      await waitFor(() => expect(root).toHaveClass('light'));
      await expect(localStorage.getItem(storageKey)).toBe('light');
    });
  },
};

export const System: Story = {
  args: { defaultTheme: 'system' },
  parameters: { docs: { description: { story: '跟随当前运行浏览器的系统配色，不假定测试机器一定是浅色。' } } },
  play: async ({ canvas }) => {
    const root = canvas.getByRole('status').ownerDocument.documentElement;
    const expected = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    await expect(canvas.getByRole('status')).toHaveTextContent('当前模式：system');
    await waitFor(() => expect(root).toHaveClass(expected));
  },
};

export const SavedPreference: Story = {
  parameters: {
    savedTheme: 'dark',
    docs: { description: { story: '挂载前预置已保存的 dark，即使 defaultTheme 为 light，水合后仍恢复保存值。' } },
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('当前模式：dark'));
  },
};

export const KeyboardShortcut: Story = {
  args: { keyboardShortcut: 'd' },
  play: async ({ canvas, userEvent, step }) => {
    await step('输入框内不触发快捷键，离开后可切换', async () => {
      const input = canvas.getByRole('textbox', { name: '快捷键输入保护示例' });
      await userEvent.type(input, 'd');
      await expect(input).toHaveValue('d');
      await expect(canvas.getByRole('status')).toHaveTextContent('当前模式：light');
      // 点击按钮让焦点离开输入区域，再发送全局快捷键。
      await userEvent.click(canvas.getByRole('button', { name: '浅色' }));
      await userEvent.keyboard('d');
      await expect(canvas.getByRole('status')).toHaveTextContent('当前模式：dark');
    });
  },
};

export const StorageSync: Story = {
  parameters: { docs: { description: { story: '模拟其他标签页的 storage 通知，验证主题更新、无关键过滤和删除后的默认回退。' } } },
  play: async ({ canvas, step }) => {
    const status = canvas.getByRole('status');
    await step('接收有效主题，忽略无关键，删除后恢复默认', async () => {
      dispatchStorageChange(storageKey, 'dark');
      await waitFor(() => expect(status).toHaveTextContent('当前模式：dark'));
      dispatchStorageChange('unrelated-key', 'light');
      await expect(status).toHaveTextContent('当前模式：dark');
      dispatchStorageChange(storageKey, null);
      await waitFor(() => expect(status).toHaveTextContent('当前模式：light'));
      dispatchStorageChange(storageKey, 'dark');
      await waitFor(() => expect(status).toHaveTextContent('当前模式：dark'));
      dispatchStorageChange(null, null); // key 为 null 表示其他标签页 clear() 的通知。
      await waitFor(() => expect(status).toHaveTextContent('当前模式：light'));
    });
  },
};

export const StorageReadFailure: Story = {
  parameters: {
    storageFailure: 'getItem',
    docs: { description: { story: '只模拟本示例的存储读取被拒绝，Provider 应使用默认主题继续运行。' } },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('当前模式：light');
  },
};

export const StorageWriteFailure: Story = {
  parameters: { storageFailure: 'setItem', docs: { description: { story: '存储写入失败时仍允许在当前页面切换主题。' } } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '深色' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('当前模式：dark');
    await expect(localStorage.getItem(storageKey)).toBeNull();
  },
};

export const KeepTransitions: Story = {
  args: { disableTransitionOnChange: false },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: '深色' }));
    await waitFor(() => expect(canvas.getByRole('status').ownerDocument.documentElement).toHaveClass('dark'));
  },
};

export const SystemChanges: Story = {
  args: { defaultTheme: 'system' },
  parameters: { docs: { description: { story: '测试中模拟系统深浅色切换，验证 system 跟随，显式选择后停止跟随；结束时恢复原 matchMedia。' } } },
  play: async ({ canvas, userEvent, step }) => {
    // 在操作中切入 system，使 Provider 订阅本次可控的 MediaQueryList。
    const system = mockSystemColor(true);
    const root = canvas.getByRole('status').ownerDocument.documentElement;
    try {
      await userEvent.click(canvas.getByRole('button', { name: '浅色' }));
      await userEvent.click(canvas.getByRole('button', { name: '跟随系统' }));
      await waitFor(() => expect(root).toHaveClass('dark'));
      await step('系统切换时跟随，显式选择后保持用户主题', async () => {
        system.setDark(false);
        await waitFor(() => expect(root).toHaveClass('light'));
        await userEvent.click(canvas.getByRole('button', { name: '深色' }));
        system.setDark(false);
        await waitFor(() => expect(root).toHaveClass('dark'));
      });
    } finally {
      system.restore();
    }
  },
};
