import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { ScrollArea, ScrollBar } from './scroll-area';
function Example({ horizontal = false, short = false }: { horizontal?: boolean; short?: boolean }) {
  return (
    <ScrollArea className="h-56 w-full rounded-lg border">
      <div
        role="region"
        aria-label="文档列表"
        tabIndex={0}
        className={horizontal ? 'flex w-max gap-4 p-4' : 'flex flex-col gap-3 p-4'}
      >
        {Array.from({ length: short ? 2 : 20 }, (_, i) => (
          <p key={i} className="shrink-0 text-sm">
            组件文档 {String(i + 1).padStart(2, '0')}
          </p>
        ))}
      </div>
      {horizontal && <ScrollBar orientation="horizontal" />}
    </ScrollArea>
  );
}
const meta = {
  title: 'Components/ScrollArea',
  component: Example,
  args: { horizontal: false, short: false },
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
          '保留原生滚动行为的自定义滚动区。外层需明确尺寸；横向内容使用 w-max，并添加横向 ScrollBar。示例内容提供可聚焦区域，支持键盘滚动。聊天消息请使用 MessageScroller。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const region = canvas.getByRole('region', { name: '文档列表' });
    const viewport = region.closest<HTMLElement>('[data-slot=scroll-area-viewport]')!;
    await userEvent.click(region);
    region.focus();
    await expect(region).toHaveFocus();
    viewport.scrollTo({ top: 120, behavior: 'instant' });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
  },
};
export const Horizontal: Story = { args: { horizontal: true } };
export const ShortContent: Story = { args: { short: true } };
export const LongText: Story = {
  render: () => (
    <ScrollArea className="h-56 rounded-lg border">
      <article aria-label="使用说明" tabIndex={0} className="flex flex-col gap-4 p-4 text-sm">
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i}>组件遵循统一的主题和交互规范。你可以通过键盘或滚轮浏览文档，并检查不同内容长度下的滚动效果。</p>
        ))}
      </article>
    </ScrollArea>
  ),
};
