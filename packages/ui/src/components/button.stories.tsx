import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { PlusIcon } from 'lucide-react';
import { Button } from './button';

const variants = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const;
const textSizes = ['xs', 'sm', 'default', 'lg'] as const;
const iconSizes = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: '保存', type: 'button', disabled: false, onClick: fn() },
  decorators: [(Story) => <div style={{ padding: 24 }}><Story /></div>],
  parameters: {
    docs: { description: { component: '基于 Base UI 的按钮，支持样式、尺寸及禁用状态。原生 button 支持 Enter / Space 激活；图标按钮需提供可访问名称。link 只是视觉样式，不会自动变为导航链接。' } },
  },
  argTypes: {
    children: { control: 'text', description: '可见按钮内容；纯图标按钮需额外提供 aria-label。' },
    variant: { control: 'select', options: [...variants], description: '按钮视觉样式，默认 default。' },
    size: { control: 'select', options: [...textSizes, ...iconSizes], description: '文字按钮与图标按钮尺寸，默认 default。' },
    type: { control: 'select', options: ['button', 'submit', 'reset'], description: '原生按钮类型；本示例使用 button，避免触发表单提交。' },
    disabled: { control: 'boolean', description: '禁用时不可激活，并从普通 Tab 焦点顺序中跳过。' },
    className: { control: false, description: '可传类名或接收 Base UI 状态的函数，组件会与内置样式组合。' },
    onClick: { control: false, description: '鼠标点击或键盘激活时触发，通过 fn 记录并断言。' },
    'aria-label': { control: 'text', description: '在没有可见文字时提供用途名称。' },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args, step }) => {
    const button = canvas.getByRole('button', { name: '保存' });
    await step('支持鼠标点击、Enter 和 Space 激活', async () => {
      await userEvent.click(button);
      await expect(button).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      // 三种激活方式分别触发一次点击；键盘操作前按钮已获得焦点。
      await expect(args.onClick).toHaveBeenCalledTimes(3);
    });
  },
};

export const Variants: Story = {
  parameters: { docs: { description: { story: '集中展示所有视觉样式；destructive 表达危险操作，link 仍是按钮语义。' } } },
  render: (args) => (
    <div className="flex flex-wrap gap-4" role="group" aria-label="按钮样式">
      {variants.map((variant) => <Button {...args} key={variant} variant={variant}>{variant}</Button>)}
    </div>
  ),
  play: async ({ canvas, userEvent, args }) => {
    // 按每个样式的名称查找，避免把预览工具栏中的主题切换按钮计入测试。
    for (const variant of variants) {
      await userEvent.click(canvas.getByRole('button', { name: variant }));
    }
    await expect(args.onClick).toHaveBeenCalledTimes(variants.length);
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4" role="group" aria-label="文字按钮尺寸">
      {textSizes.map((size) => <Button {...args} key={size} size={size}>{size}</Button>)}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <Button type="button">前一个按钮</Button>
      <Button {...args} />
      <Button type="button">后一个按钮</Button>
    </div>
  ),
  play: async ({ canvas, userEvent, args, step }) => {
    const disabled = canvas.getByRole('button', { name: '保存' });
    await step('禁用按钮被 Tab 跳过，不触发点击回调', async () => {
      await expect(disabled).toBeDisabled();
      await userEvent.click(canvas.getByRole('button', { name: '前一个按钮' }));
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name: '后一个按钮' })).toHaveFocus();
      await expect(disabled).not.toHaveFocus();
      await expect(args.onClick).not.toHaveBeenCalled();
    });
  },
};

export const IconButtons: Story = {
  parameters: { docs: { description: { story: '为每个图标按钮提供 aria-label，图标自身对辅助技术隐藏。图标尺寸由 Button 的内置规则控制。' } } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4" role="group" aria-label="图标按钮尺寸">
      {iconSizes.map((size) => (
        <Button {...args} key={size} size={size} aria-label={`添加项目 ${size}`}>
          <PlusIcon aria-hidden="true" />
        </Button>
      ))}
    </div>
  ),
  play: async ({ canvas, userEvent, args }) => {
    for (const size of iconSizes) {
      await userEvent.click(canvas.getByRole('button', { name: `添加项目 ${size}` }));
    }
    await expect(args.onClick).toHaveBeenCalledTimes(iconSizes.length);
  },
};

export const FunctionClassName: Story = {
  args: {
    // Base UI 将当前按钮状态传入函数；只增补布局类，不替换内置颜色和排版。
    className: (state) => state.disabled ? 'min-w-24' : 'min-w-32',
  },
  parameters: { docs: { description: { story: '展示函数形式的 className：读取 Base UI 状态并返回额外类名，覆盖此前未执行的函数分支。' } } },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: '保存' });
    await expect(button).toHaveClass('min-w-32');
    // 同时确认组合后仍保留组件标记与点击能力，而非只检查类名存在。
    await expect(button).toHaveAttribute('data-slot', 'button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
