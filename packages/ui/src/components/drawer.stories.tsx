import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from './drawer';
import { Button } from './button';
function Example({
  direction = 'down',
  handle = false,
  snap = false,
  long = false,
  nonModal = false,
}: {
  direction?: 'down' | 'up' | 'left' | 'right';
  handle?: boolean;
  snap?: boolean;
  long?: boolean;
  nonModal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      swipeDirection={direction}
      showSwipeHandle={handle}
      modal={!nonModal}
      snapPoints={snap ? [0.5, 0.9] : undefined}
    >
      <DrawerTrigger render={<Button variant="outline" />}>打开抽屉</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>发布前检查</DrawerTitle>
          <DrawerDescription>查看检查项，可通过按钮、Escape 或滑动关闭。</DrawerDescription>
        </DrawerHeader>
        <div
          className="min-h-0 overflow-y-auto p-4"
          tabIndex={long ? 0 : undefined}
          role={long ? 'region' : undefined}
          aria-label={long ? '检查项列表' : undefined}
        >
          {Array.from({ length: long ? 20 : 3 }, (_, index) => (
            <p key={index} className="mb-3">
              检查项 {index + 1}：确认主题、布局和交互符合预期。
            </p>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>完成检查</DrawerClose>
          <DrawerClose render={<Button variant="outline" />}>取消</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
const meta = {
  title: 'Components/Drawer',
  component: Example,
  args: { direction: 'down', handle: false, snap: false, long: false, nonModal: false },
  argTypes: { direction: { control: 'select', options: ['down', 'up', 'left', 'right'] } },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '基于 Base UI Drawer，支持四个滑动关闭方向、拖动手柄与吸附点。down 对应底部抽屉，up 对应顶部；left/right 对应左右侧。吸附点为视口高度比例。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '打开抽屉' });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog', { name: '发布前检查' })).toBeVisible());
    await userEvent.click(body.getByRole('button', { name: '完成检查' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 5000 });
    await expect(trigger).toHaveFocus();
  },
};
export const Top: Story = { args: { direction: 'up' } };
export const Left: Story = { args: { direction: 'left' } };
export const Right: Story = { args: { direction: 'right' } };
export const SwipeHandle: Story = { args: { handle: true } };
export const SnapPoints: Story = { args: { handle: true, snap: true, long: true } };
export const ScrollableContent: Story = { args: { long: true } };
export const NonModal: Story = { args: { nonModal: true, direction: 'right' } };
