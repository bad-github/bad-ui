import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Button } from './button';
function Example({ side = 'top', delay = 0 }: { side?: 'top' | 'bottom' | 'left' | 'right'; delay?: number }) {
  return (
    <TooltipProvider delay={delay}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>查看帮助</TooltipTrigger>
        <TooltipContent role="tooltip" side={side}>
          在文档中查看组件属性和示例。
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
const meta = {
  title: 'Components/Tooltip',
  component: Example,
  args: { side: 'top', delay: 0 },
  argTypes: { side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] } },
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
          '悬停或聚焦时显示的补充说明。必需信息不要只放在提示中；需要按钮、输入框等交互内容时使用 Popover。Provider 管理显示延迟。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '查看帮助' });
    await userEvent.hover(trigger);
    await waitFor(() => expect(body.getByRole('tooltip')).toBeVisible());
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};
export const Bottom: Story = { args: { side: 'bottom' } };
export const Right: Story = { args: { side: 'right' } };
export const Delayed: Story = { args: { delay: 600 } };
export const KeyboardFocus: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    canvas.getByRole('button', { name: '查看帮助' }).focus();
    await waitFor(() => expect(body.getByRole('tooltip')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};
