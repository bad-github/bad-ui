import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BoldIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Toggle } from './toggle';
function Example({
  variant = 'default',
  size = 'default',
  disabled = false,
  initial = false,
  text = false,
}: {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  initial?: boolean;
  text?: boolean;
}) {
  const [pressed, setPressed] = useState(initial);
  return (
    <Toggle
      aria-label="加粗"
      variant={variant}
      size={size}
      disabled={disabled}
      pressed={pressed}
      onPressedChange={setPressed}
    >
      <BoldIcon aria-hidden="true" />
      {text && '加粗'}
    </Toggle>
  );
}
const meta = {
  title: 'Components/Toggle',
  component: Example,
  args: { variant: 'default', size: 'default', disabled: false, initial: false, text: false },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline'] },
    size: { control: 'select', options: ['default', 'sm', 'lg'] },
  },
  render: (args) => <Example key={String(args.initial)} {...args} />,
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
          '具有按下状态的按钮，通过 aria-pressed 表达状态。图标按钮需要可访问名称，名称保持稳定，不随选中状态改变。多个相关选项使用 ToggleGroup。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const button = canvas.getByRole('button', { name: '加粗' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};
export const Outline: Story = { args: { variant: 'outline' } };
export const Pressed: Story = { args: { initial: true } };
export const Disabled: Story = { args: { disabled: true } };
export const WithText: Story = { args: { text: true } };
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Example size="sm" />
      <Example />
      <Example size="lg" />
    </div>
  ),
};
