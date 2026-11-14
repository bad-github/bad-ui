import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Button } from './button';
function Example({
  variant = 'default',
  vertical = false,
  disabled = false,
  initial = 'overview',
  controlled = false,
}: {
  variant?: 'default' | 'line';
  vertical?: boolean;
  disabled?: boolean;
  initial?: string;
  controlled?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex flex-col items-start gap-4">
      {controlled && (
        <Button variant="outline" onClick={() => setValue('settings')}>
          外部切换到设置
        </Button>
      )}
      <Tabs
        value={value}
        onValueChange={(next) => setValue(String(next))}
        orientation={vertical ? 'vertical' : 'horizontal'}
        className="w-full"
      >
        <TabsList variant={variant} aria-label="项目页面">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="settings" disabled={disabled}>
            设置
          </TabsTrigger>
          <TabsTrigger value="history">记录</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="p-4">
          项目概览与使用统计。
        </TabsContent>
        <TabsContent value="settings" className="p-4">
          项目设置与外观偏好。
        </TabsContent>
        <TabsContent value="history" className="p-4">
          最近的版本更新记录。
        </TabsContent>
      </Tabs>
    </div>
  );
}
const meta = {
  title: 'Components/Tabs',
  component: Example,
  args: { variant: 'default', vertical: false, disabled: false, initial: 'overview', controlled: false },
  argTypes: {
    variant: { control: 'select', options: ['default', 'line'] },
    initial: { control: 'select', options: ['overview', 'settings', 'history'] },
  },
  render: (args) => <Example key={args.initial} {...args} />,
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
          '选项卡在同一页面切换相关内容，触发器必须位于 TabsList 内。支持线条样式、纵向、禁用项和外部受控切换；键盘方向键移动焦点，Enter 激活。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('tab', { name: '设置' }));
    await expect(canvas.getByRole('tabpanel', { name: '设置' })).toBeVisible();
    await expect(canvas.getByRole('tab', { name: '设置' })).toHaveAttribute('aria-selected', 'true');
  },
};
export const Line: Story = { args: { variant: 'line' } };
export const Vertical: Story = { args: { vertical: true } };
export const DisabledTab: Story = { args: { disabled: true } };
export const WithInitialValue: Story = { args: { initial: 'history' } };
export const Controlled: Story = {
  args: { controlled: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '外部切换到设置' }));
    await expect(canvas.getByRole('tabpanel', { name: '设置' })).toBeVisible();
  },
};
