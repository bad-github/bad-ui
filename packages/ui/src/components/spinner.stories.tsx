import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './spinner';
import { Button } from './button';
const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { 'aria-label': '正在加载' },
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
          '加载指示图标，默认具有 status 语义。独立使用时提供描述性的 aria-label；已有状态文字时，可将图标作为装饰隐藏。按钮加载状态还需设置 disabled。',
      },
    },
  },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="size-4" aria-label="小号加载指示器" />
      <Spinner className="size-6" aria-label="中号加载指示器" />
      <Spinner className="size-8" aria-label="大号加载指示器" />
    </div>
  ),
};
export const WithText: Story = {
  render: () => (
    <p role="status" className="flex items-center gap-2 text-sm">
      <Spinner role="presentation" aria-hidden="true" />
      正在同步组件文档
    </p>
  ),
};
export const InButton: Story = {
  render: () => (
    <Button disabled>
      <Spinner role="presentation" aria-hidden="true" data-icon="inline-start" />
      正在保存
    </Button>
  ),
};
