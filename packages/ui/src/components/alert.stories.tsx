import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { InfoIcon, TriangleAlertIcon } from 'lucide-react';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Alert, AlertAction, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  subcomponents: { AlertTitle, AlertDescription, AlertAction },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
  args: { variant: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'destructive'] }, children: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          '静态提示区域，默认带 alert 语义。组合标题、说明、图标和操作使用；不会自动关闭，也不会自动触发操作。',
      },
    },
  },
  render: (args) => (
    <Alert {...args}>
      <InfoIcon aria-hidden="true" />
      <AlertTitle>外观已更新</AlertTitle>
      <AlertDescription>新的主题设置将在当前预览中生效。</AlertDescription>
    </Alert>
  ),
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args}>
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>保存失败</AlertTitle>
      <AlertDescription>请检查网络连接，然后重试。当前输入仍然保留。</AlertDescription>
    </Alert>
  ),
};
export const WithoutIcon: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>预览模式</AlertTitle>
      <AlertDescription>此处的操作仅用于演示。</AlertDescription>
    </Alert>
  ),
};
export const TitleOnly: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoIcon aria-hidden="true" />
      <AlertTitle>所有更改已保存。</AlertTitle>
    </Alert>
  ),
};
const onRetry = fn();
export const WithAction: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoIcon aria-hidden="true" />
      <AlertTitle>同步已暂停</AlertTitle>
      <AlertDescription>点击重试以模拟重新同步。</AlertDescription>
      <AlertAction>
        <Button size="xs" variant="outline" onClick={onRetry}>
          重试
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    onRetry.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: '重试' }));
    await expect(onRetry).toHaveBeenCalledOnce();
  },
};
export const LongContent: Story = {
  render: (args) => (
    <Alert {...args}>
      <InfoIcon aria-hidden="true" />
      <AlertTitle>导入前请确认文件内容</AlertTitle>
      <AlertDescription>
        <p>配置文件包含主题、基础色和圆角等外观偏好。导入后，请检查预览是否符合预期。</p>
        <ul className="list-disc pl-4">
          <li>确认主题名称仍在可用列表中。</li>
          <li>圆角应为有限的非负数值。</li>
          <li>请保留一份原始配置，方便手动恢复。</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
};
