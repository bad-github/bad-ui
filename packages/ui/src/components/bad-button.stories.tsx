import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { BadButton, type BadButtonProps } from './bad-button';
import { Button } from './button';

const variants = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const;
const sizes = ['xs', 'sm', 'default', 'lg'] as const;
const iconSizes = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;

const meta = {
  title: 'Custom Components/BadButton',
  component: BadButton,
  args: { children: '保存', type: 'button', loading: false, disabled: false, onClick: fn() },
  argTypes: {
    loading: { control: 'boolean', description: '显示 Spinner 并禁用交互，保留按钮原有内容。' },
    disabled: { control: 'boolean', description: '主动禁用，加载结束后仍保留此设置。' },
    variant: { control: 'select', options: [...variants] },
    size: { control: 'select', options: [...sizes, ...iconSizes] },
    children: { control: 'text', description: '按钮内容；纯图标按钮需设置 aria-label。' },
    onClick: { control: false },
    className: { control: false },
    'aria-label': { control: 'text', description: '纯图标按钮的可访问名称。' },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '在现有 Button 上增加 loading 状态，沿用样式、尺寸及原生属性。加载时通过 disabled 阻止激活，通过 aria-busy 表达忙碌状态；Spinner 仅作装饰。图标按钮加载时建议替换原图标，避免并排显示两个图标。',
      },
    },
  },
} satisfies Meta<typeof BadButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const button = canvas.getByRole('button', { name: '保存' });
    await userEvent.click(button);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
    await expect(button.querySelector('[data-slot="spinner"]')).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button type="button">前一个按钮</Button>
      <BadButton {...args} />
      <Button type="button">后一个按钮</Button>
    </div>
  ),
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const button = canvas.getByRole('button', { name: '保存' });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button.querySelector('[data-slot="spinner"]')).toHaveAttribute('aria-hidden', 'true');
    // disabled 禁止原生点击；用 DOM click 避免测试库因 pointer-events:none 提前抛错。
    button.click();
    await userEvent.click(canvas.getByRole('button', { name: '前一个按钮' }));
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '后一个按钮' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Variants: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="flex flex-wrap gap-4" role="group" aria-label="加载按钮样式">
      {variants.map((variant) => (
        <BadButton {...args} key={variant} variant={variant}>
          {variant}
        </BadButton>
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4" role="group" aria-label="加载按钮尺寸">
      {sizes.map((size) => (
        <BadButton {...args} key={size} size={size}>
          {size}
        </BadButton>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    // 验证实际渲染尺寸，确保 Spinner 默认的 size-4 不会覆盖小按钮的图标比例。
    for (const [size, width] of [
      ['xs', '12px'],
      ['sm', '14px'],
      ['default', '16px'],
      ['lg', '16px'],
    ] as const) {
      const spinner = canvas.getByRole('button', { name: size }).querySelector('svg');
      await expect(spinner).not.toBeNull();
      await expect(getComputedStyle(spinner!).width).toBe(width);
    }
  },
};
export const IconButtons: Story = {
  args: { loading: true },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4" role="group" aria-label="图标加载按钮尺寸">
      {iconSizes.map((size) => (
        <BadButton {...args} key={size} size={size} aria-label={`保存 ${size}`}>
          {null}
        </BadButton>
      ))}
    </div>
  ),
};

function InteractiveExample(args: BadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      {/* 控制按钮放在示例按钮之外，加载期间仍可操作，不依赖定时器模拟请求。 */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setLoading((value) => !value)} variant="outline">
          {loading ? '结束加载' : '开始加载'}
        </Button>
        <Button onClick={() => setDisabled((value) => !value)} variant="outline">
          {disabled ? '取消禁用' : '主动禁用'}
        </Button>
      </div>
      <BadButton {...args} loading={loading} disabled={args.disabled || disabled} />
    </div>
  );
}
export const Interactive: Story = {
  render: (args) => <InteractiveExample {...args} />,
  parameters: {
    docs: { description: { story: '手动切换加载和禁用状态。加载结束后恢复操作，但不会覆盖主动设置的 disabled。' } },
  },
  play: async ({ canvas, userEvent, args, step }) => {
    if (!shouldRunInteractions) return;
    const button = canvas.getByRole('button', { name: '保存' });
    await step('加载结束后恢复操作', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '开始加载' }));
      await expect(button).toBeDisabled();
      await userEvent.click(canvas.getByRole('button', { name: '结束加载' }));
      await expect(button).toBeEnabled();
      await expect(button).not.toHaveAttribute('aria-busy', 'true');
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalledOnce();
    });
    await step('加载结束后仍保留主动禁用状态', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '主动禁用' }));
      await userEvent.click(canvas.getByRole('button', { name: '开始加载' }));
      await userEvent.click(canvas.getByRole('button', { name: '结束加载' }));
      await expect(button).toBeDisabled();
      await userEvent.click(canvas.getByRole('button', { name: '取消禁用' }));
      await expect(button).toBeEnabled();
    });
  },
};
