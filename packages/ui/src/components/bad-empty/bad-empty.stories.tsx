import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../../.storybook/testing/interaction-mode';
import { BadEmpty } from './index';

const meta = {
  title: 'Custom Components/BadEmpty',
  component: BadEmpty,
  args: { type: 'component', text: 'No data' },
  argTypes: {
    type: {
      control: 'select',
      options: ['component', 'page'],
      description: '选择紧凑图标或较大的页面插图，不改变容器定位。',
    },
    text: { control: 'text', description: '空状态文案，由调用方提供国际化文本。' },
    className: { control: 'text', description: '容器类名，可设置间距和布局。' },
    style: { control: 'object', description: '透传给容器的内联样式。' },
  },
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
          '简洁的空状态组件，包含装饰图标和文案，支持 component、page 两种图形。容器透传原生 div 属性。需要标题、说明和操作区时，可使用 shadcn 的 Empty 组合组件。',
      },
    },
  },
} satisfies Meta<typeof BadEmpty>;
export default meta;
type Story = StoryObj<typeof meta>;

// 图标只作装饰；空状态的含义由可见文案表达，避免读屏朗读 SVG 内部标题。
const checkDecorativeIcon: NonNullable<Story['play']> = async ({ canvas, args }) => {
  if (!shouldRunInteractions) return;
  const empty = canvas.getByText(args.text ?? 'No data');
  await expect(empty).toBeVisible();
  // 将查询限定到组件，避免匹配 Storybook 全局装饰器中的图标。
  const icon = empty.querySelector('svg');
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(icon).toHaveAttribute('focusable', 'false');
};

export const Default: Story = { play: checkDecorativeIcon };
export const Page: Story = { args: { type: 'page', text: '暂无内容' }, play: checkDecorativeIcon };
export const CustomText: Story = { args: { text: '没有找到匹配的结果，请尝试其他关键词。' } };
export const LongText: Story = {
  args: {
    type: 'page',
    text: '当前还没有可以展示的内容。你可以调整筛选条件，或等待新的数据同步后再来查看。',
    className: 'mx-auto max-w-48',
  },
  parameters: {
    docs: { description: { story: '限制容器宽度，检查较长文案的换行与居中对齐。' } },
  },
};
export const CustomLayout: Story = {
  args: { type: 'page', text: '暂无记录', className: 'min-h-64 justify-center', 'aria-label': '记录列表空状态' },
  parameters: {
    docs: { description: { story: '通过 className 设置区域最小高度和垂直居中，同时透传 aria-label。' } },
  },
};
export const MultipleInstances: Story = {
  render: (args) => (
    <div className="flex flex-wrap justify-around gap-8">
      <BadEmpty {...args} type="page" text="暂无项目" />
      <BadEmpty {...args} type="page" text="暂无文件" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunInteractions) return;
    // 页面插图包含渐变；多实例的 ID 必须独立，且每张图只引用自己的渐变。
    const gradients = [...canvasElement.querySelectorAll('linearGradient')];
    await expect(gradients).toHaveLength(4);
    await expect(new Set(gradients.map((gradient) => gradient.id)).size).toBe(4);
    for (const svg of canvasElement.querySelectorAll('svg')) {
      const ids = [...svg.querySelectorAll('linearGradient')].map((gradient) => gradient.id);
      for (const shape of svg.querySelectorAll('[fill^="url(#"]')) {
        await expect(ids.some((id) => shape.getAttribute('fill') === `url(#${id})`)).toBe(true);
      }
    }
  },
};
