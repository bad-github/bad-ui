import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { ThemeToggle } from './theme-toggle';
import type { ThemeToggleProps } from './theme-toggle';
import { ThemeProvider, useTheme } from '../providers/theme-provider';
import { prepareProviderEnvironment } from '../../.storybook/testing/provider-environment';

const storageKey = 'bad-ui:storybook:demo:theme-toggle';

function ToggleExample(args: ThemeToggleProps) {
  const { theme } = useTheme();
  return (
    <section className="flex flex-col gap-4" aria-label="主题按钮示例" style={{ padding: 24 }}>
      <ThemeToggle {...args} />
      <p role="status">当前主题：{theme}</p>
    </section>
  );
}

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  args: { onClick: fn(), disabled: false },
  render: (args) => <ThemeProvider defaultTheme="light" storageKey={storageKey}><ToggleExample {...args} /></ThemeProvider>,
  parameters: {
    isolatedThemeProvider: true,
    docs: { description: { component: '依赖 ThemeProvider，通过点击切换深浅主题。调用方 onClick 先执行，可通过 preventDefault() 取消本次切换。图标按钮通过隐藏文本提供可访问名称。' } },
  },
  argTypes: {
    darkLabel: { control: 'text', description: '当前浅色时按钮的可访问名称，说明切换到深色。' },
    lightLabel: { control: 'text', description: '当前深色时按钮的可访问名称，说明切换到浅色。' },
    disabled: { control: 'boolean', description: '禁用按钮，不允许用户切换主题。' },
    onClick: { control: false, description: '优先执行的点击回调，调用 preventDefault 可阻止主题切换。' },
  },
  beforeEach: () => prepareProviderEnvironment(storageKey),
} satisfies Meta<typeof ThemeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args, step }) => {
    await step('按钮名称随切换目标更新，点击回调和存储正常', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '切换到深色主题' }));
      await expect(args.onClick).toHaveBeenCalled();
      await expect(canvas.getByRole('status')).toHaveTextContent('当前主题：dark');
      await expect(localStorage.getItem(storageKey)).toBe('dark');
      await userEvent.click(canvas.getByRole('button', { name: '切换到浅色主题' }));
      await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('当前主题：light'));
    });
  },
};

export const PreventToggle: Story = {
  // fn 包裹真实示例回调：既执行取消操作，又保留 Actions / 断言所需的调用记录。
  args: { onClick: fn((event: { preventDefault: () => void }) => event.preventDefault()) },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: '切换到深色主题' }));
    await expect(args.onClick).toHaveBeenCalled();
    await expect(canvas.getByRole('status')).toHaveTextContent('当前主题：light');
    await expect(localStorage.getItem(storageKey)).toBeNull();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('button', { name: '切换到深色主题' })).toBeDisabled();
    await expect(canvas.getByRole('status')).toHaveTextContent('当前主题：light');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
