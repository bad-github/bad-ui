import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { sampleImage } from '../../.storybook/testing/sample-image';
import { AspectRatio } from './aspect-ratio';

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  args: { ratio: 16 / 9 },
  argTypes: {
    ratio: { control: { type: 'number', min: 0.1, step: 0.1 }, description: '宽 / 高，需提供正数，例如 16 / 9。' },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '使用 CSS aspect-ratio 保持容器宽高比。宽度跟随父容器变化；子元素应按容器尺寸布局。组件本身不会校验 ratio。',
      },
    },
  },
  render: (args) => (
    <AspectRatio {...args}>
      <div className="flex size-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        比例 {Number(args.ratio.toFixed(3))} : 1
      </div>
    </AspectRatio>
  ),
} satisfies Meta<typeof AspectRatio>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    if (!shouldRunInteractions) return;
    const bounds = canvasElement.querySelector('[data-slot="aspect-ratio"]')!.getBoundingClientRect();
    await expect(bounds.width).toBeGreaterThan(0);
    await expect(bounds.width / bounds.height).toBeCloseTo(args.ratio, 1);
  },
};
export const Square: Story = { args: { ratio: 1 } };
export const Portrait: Story = { args: { ratio: 3 / 4 } };
export const Widescreen: Story = { args: { ratio: 21 / 9 } };
export const Image: Story = {
  render: (args) => (
    <AspectRatio {...args}>
      <img src={sampleImage} alt="按容器比例裁切的 UI 示例图片" className="size-full rounded-lg object-cover" />
    </AspectRatio>
  ),
};
export const Ratios: Story = {
  render: () => (
    <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-3">
      {[
        { ratio: 16 / 9, label: '16 : 9' },
        { ratio: 1, label: '1 : 1' },
        { ratio: 3 / 4, label: '3 : 4' },
      ].map(({ ratio, label }) => (
        <figure key={label} className="flex flex-col gap-2">
          <AspectRatio ratio={ratio}>
            <div className="size-full rounded-lg border bg-muted" />
          </AspectRatio>
          <figcaption className="text-sm text-muted-foreground">{label}</figcaption>
        </figure>
      ))}
    </div>
  ),
};
