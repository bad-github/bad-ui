import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './carousel';
function Example({ vertical = false, loop = false, multiple = false, single = false }) {
  return (
    <Carousel
      orientation={vertical ? 'vertical' : 'horizontal'}
      opts={{ loop }}
      aria-label="示例轮播"
      className="w-full max-w-xs"
    >
      <CarouselContent className={vertical ? 'h-60' : ''}>
        {Array.from({ length: single ? 1 : 5 }, (_, i) => (
          <CarouselItem key={i} className={multiple ? 'basis-1/2' : ''}>
            <div className="flex h-60 items-center justify-center rounded-lg border bg-muted text-2xl">{i + 1}</div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
const meta = {
  title: 'Components/Carousel',
  component: Example,
  args: { vertical: false, loop: false, multiple: false, single: false },
  decorators: [
    (Story) => (
      <div className="px-16 py-16">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '基于 Embla，支持拖动、前后切换、循环、纵向布局和一屏多项。按钮状态跟随滚动边界变化。示例不自动播放。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const previous = canvas.getByRole('button', { name: 'Previous slide' });
    const next = canvas.getByRole('button', { name: 'Next slide' });
    await waitFor(() => expect(next).toBeEnabled());
    await expect(previous).toBeDisabled();
    await userEvent.click(next);
    await waitFor(() => expect(previous).toBeEnabled());
    await userEvent.click(previous);
    await waitFor(() => expect(previous).toBeDisabled());
  },
};
export const Loop: Story = { args: { loop: true } };
export const Vertical: Story = { args: { vertical: true } };
export const MultipleItems: Story = { args: { multiple: true } };
export const SingleItem: Story = {
  args: { single: true },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  },
};
