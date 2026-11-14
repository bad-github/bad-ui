import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
function Example({
  multiple = false,
  disabled = false,
  vertical = false,
  joined = false,
  variant = 'default',
  size = 'default',
}: {
  multiple?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  joined?: boolean;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        aria-label="文本格式"
        multiple={multiple}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        orientation={vertical ? 'vertical' : 'horizontal'}
        spacing={joined ? 0 : 2}
        variant={variant}
        size={size}
      >
        {['加粗', '斜体', '下划线'].map((item) => (
          <ToggleGroupItem key={item} value={item} aria-label={item}>
            {item}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p role="status" className="text-sm">
        {value.length ? `已选择：${value.join('、')}` : '未选择格式'}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/ToggleGroup',
  component: Example,
  args: { multiple: false, disabled: false, vertical: false, joined: false, variant: 'default', size: 'default' },
  render: (args) => <Example key={String(args.multiple)} {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '相关切换按钮组，单选与多选都使用数组 value。multiple 控制是否允许同时按下多项；spacing=0 可形成相连外观。示例单选只演示互斥状态，文本格式实际可组合时使用多选。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '加粗' }));
    await userEvent.click(canvas.getByRole('button', { name: '斜体' }));
    await expect(canvas.getByRole('button', { name: '加粗' })).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getByRole('button', { name: '斜体' })).toHaveAttribute('aria-pressed', 'true');
  },
};
export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    for (const name of ['加粗', '斜体']) {
      await userEvent.click(canvas.getByRole('button', { name }));
      await expect(canvas.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
    }
  },
};
export const Outline: Story = { args: { variant: 'outline' } };
export const Joined: Story = { args: { joined: true, variant: 'outline' } };
export const Vertical: Story = { args: { vertical: true } };
export const Disabled: Story = { args: { disabled: true } };
