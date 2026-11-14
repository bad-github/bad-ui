import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './separator';
const meta = {
  title: 'Components/Separator',
  component: Separator,
  args: { orientation: 'horizontal' },
  render: (args) => (
    <div className="flex flex-col gap-4 text-sm">
      <p>组件指南</p>
      <Separator {...args} />
      <p>主题与外观</p>
    </div>
  ),
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
          '分隔内容区域。横向需要可用宽度，纵向需要容器高度。纯装饰用途可通过 role=none 和 aria-hidden 移除分隔语义。',
      },
    },
  },
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4 text-sm">
      <span>概览</span>
      <Separator orientation="vertical" />
      <span>文档</span>
      <Separator orientation="vertical" />
      <span>更新</span>
    </div>
  ),
};
export const Decorative: Story = { args: { role: 'none', 'aria-hidden': true } };
