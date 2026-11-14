import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Slider } from './slider';
function Example({
  range = false,
  disabled = false,
  vertical = false,
  step = 1,
  min = 0,
  max = 100,
}: {
  range?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  step?: number;
  min?: number;
  max?: number;
}) {
  const id = useId();
  const [value, setValue] = useState(range ? [20, 80] : [40]);
  return (
    <div className="flex flex-col gap-6">
      <p id={id} className="text-sm font-medium">
        调整数值
      </p>
      <div className={vertical ? 'h-48 self-start px-4' : 'py-3'}>
        <Slider
          value={value}
          onValueChange={(next) => setValue(Array.isArray(next) ? next : [next])}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          orientation={vertical ? 'vertical' : 'horizontal'}
          aria-labelledby={id}
        />
      </div>
      <p role="status" className="text-sm">
        当前数值：{value.join(' – ')}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Slider',
  component: Example,
  args: { range: false, disabled: false, vertical: false, step: 1, min: 0, max: 100 },
  argTypes: { min: { control: false }, max: { control: false } },
  render: (args) => <Example key={String(args.range)} {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-md min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '通过拖动或键盘方向键调整数值，支持单值、范围、步长、纵向和禁用。value 使用数组明确滑块数量；通过 aria-labelledby 为滑块提供可访问名称。',
      },
      story: { height: 400 },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const thumb = canvas.getByRole('slider');
    thumb.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '41');
    await userEvent.keyboard('{Home}');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
  },
};
export const Range: Story = { args: { range: true } };
export const Stepped: Story = { args: { step: 10 } };
export const Vertical: Story = { args: { vertical: true } };
export const Disabled: Story = { args: { disabled: true } };
export const CustomRange: Story = { args: { min: 20, max: 60, step: 5 } };
