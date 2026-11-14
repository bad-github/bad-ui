import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Progress, ProgressLabel, ProgressValue } from './progress';
import { Button } from './button';
function Example({
  value = 40,
  max = 100,
  interactive = false,
}: {
  value?: number | null;
  max?: number;
  interactive?: boolean;
}) {
  const [current, setCurrent] = useState(value);
  return (
    <div className="flex flex-col gap-4">
      <Progress value={current} max={max}>
        <ProgressLabel>文件上传</ProgressLabel>
        {current === null ? <span className="ml-auto text-sm text-muted-foreground">等待进度</span> : <ProgressValue />}
      </Progress>
      {interactive && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={current === null || current >= max}
            onClick={() => setCurrent((previous) => Math.min(max, (previous ?? 0) + max / 10))}
          >
            增加进度
          </Button>
          <Button variant="outline" onClick={() => setCurrent(0)}>
            重置进度
          </Button>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {current === null ? '暂时无法确定任务总进度。' : `已完成 ${current} / ${max}，此示例不会上传真实文件。`}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Progress',
  component: Example,
  args: { value: 40, max: 100, interactive: false },
  argTypes: {
    value: { control: { type: 'number', min: 0 }, description: '当前进度；null 表示不确定进度。' },
    max: { control: { type: 'number', min: 1 } },
  },
  render: (args) => <Example key={`${args.value}-${args.max}`} {...args} />,
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
          '进度指示器，支持确定和不确定进度。使用 ProgressLabel 提供可访问名称，ProgressValue 显示百分比。根组件已内置 Track 和 Indicator，无需重复添加。交互示例由按钮推进，不启动自动计时。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100 } };
export const Indeterminate: Story = {
  args: { value: null },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('progressbar', { name: '文件上传' })).not.toHaveAttribute('aria-valuenow');
  },
};
export const CustomRange: Story = { args: { value: 4, max: 10 } };
export const Interactive: Story = {
  args: { interactive: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const progress = canvas.getByRole('progressbar', { name: '文件上传' });
    await userEvent.click(canvas.getByRole('button', { name: '增加进度' }));
    await expect(progress).toHaveAttribute('aria-valuenow', '50');
    await userEvent.click(canvas.getByRole('button', { name: '重置进度' }));
    await expect(progress).toHaveAttribute('aria-valuenow', '0');
  },
};
