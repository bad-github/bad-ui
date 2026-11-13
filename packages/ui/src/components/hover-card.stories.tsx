import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
function Example({
  side = 'bottom',
  align = 'center',
  delay = 300,
  rich = false,
}: {
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  rich?: boolean;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        href="https://github.com/bad-github/bad-ui"
        delay={delay}
        closeDelay={150}
        className="rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        @badnpm/ui
      </HoverCardTrigger>
      <HoverCardContent side={side} align={align} role="region" aria-label="组件库预览">
        <div className="flex items-start gap-3">
          {rich && (
            <Avatar aria-label="组件库头像">
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
          )}
          <div className="flex min-w-0 flex-col gap-2">
            <p className="font-medium">bad-ui 组件库</p>
            <p className="text-sm text-muted-foreground">基于 shadcn/ui 的 React 组件库，提供主题与交互示例。</p>
            {rich && (
              <a href="https://github.com/bad-github/bad-ui" className="text-sm underline underline-offset-4">
                查看仓库
              </a>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
function ControlledExample() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setOpen(true)}>
          打开预览
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>
          关闭预览
        </Button>
      </div>
      <HoverCard open={open} onOpenChange={setOpen}>
        <HoverCardTrigger href="https://github.com/bad-github/bad-ui">@badnpm/ui</HoverCardTrigger>
        <HoverCardContent role="region" aria-label="受控预览">
          <p>当前展示受控预览，关闭状态由调用方管理。</p>
        </HoverCardContent>
      </HoverCard>
      <p role="status">{open ? '预览已展开' : '预览已关闭'}</p>
    </div>
  );
}
const meta = {
  title: 'Components/HoverCard',
  component: Example,
  args: { side: 'bottom', align: 'center', delay: 300, rich: false },
  argTypes: {
    side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    delay: { control: { type: 'number', min: 0, step: 100 } },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md min-w-0 p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '链接的补充预览，支持延迟、方向、对齐和受控开关。链接本身保持正常导航语义，不应将必需操作或关键信息仅放在悬停内容中；触屏使用者仍可直接访问链接。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('link', { name: '@badnpm/ui' });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.hover(trigger);
    await waitFor(() => expect(body.getByRole('region', { name: '组件库预览' })).toBeVisible(), { timeout: 5000 });
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('region', { name: '组件库预览' })).not.toBeInTheDocument(), {
      timeout: 5000,
    });
  },
};
export const RichContent: Story = { args: { rich: true } };
export const Top: Story = { args: { side: 'top' } };
export const RightAligned: Story = { args: { side: 'right', align: 'start' } };
export const Delayed: Story = { args: { delay: 800 } };
export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '打开预览' }));
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('region', { name: '受控预览' })).toBeVisible());
    await expect(canvas.getByRole('status')).toHaveTextContent('预览已展开');
    await userEvent.click(canvas.getByRole('button', { name: '关闭预览' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('预览已关闭');
  },
};
