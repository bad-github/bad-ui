import type { Meta, StoryObj } from '@storybook/react-vite';
import { UsersIcon } from 'lucide-react';
import { Marker, MarkerContent, MarkerIcon } from './marker';

const meta = {
  title: 'Components/Marker',
  component: Marker,
  args: { variant: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'separator', 'border'] } },
  render: (args) => (
    <Marker {...args}>
      <MarkerContent>今天 10:30</MarkerContent>
    </Marker>
  ),
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
          '用于对话中的时间分隔、系统通知和状态说明，支持普通行、居中分隔线和底部边框。MarkerIcon 默认为装饰图标，信息应同时用文字表达。',
      },
    },
  },
} satisfies Meta<typeof Marker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Separator: Story = { args: { variant: 'separator' } };
export const Border: Story = { args: { variant: 'border' } };
export const WithIcon: Story = {
  render: (args) => (
    <Marker {...args}>
      <MarkerIcon>
        <UsersIcon />
      </MarkerIcon>
      <MarkerContent>小林加入了项目讨论</MarkerContent>
    </Marker>
  ),
};
export const WithLink: Story = {
  render: (args) => (
    <Marker {...args}>
      <MarkerContent>
        组件已更新，<a href="https://github.com/bad-github/bad-ui">查看仓库</a>。
      </MarkerContent>
    </Marker>
  ),
};
export const LongContent: Story = {
  render: (args) => (
    <Marker {...args}>
      <MarkerIcon>
        <UsersIcon />
      </MarkerIcon>
      <MarkerContent>
        项目成员已加入当前对话。后续的组件设计、交互反馈和版本更新记录会保留在这里，方便所有成员继续讨论与查阅。
      </MarkerContent>
    </Marker>
  ),
};
