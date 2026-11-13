import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';
import { Button } from './button';
function Example({ defaultOpen = false, disabled = false, controlled = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Collapsible {...(controlled ? { open, onOpenChange: setOpen } : { defaultOpen })} disabled={disabled}>
        <CollapsibleTrigger render={<Button variant="outline" />}>显示配置详情</CollapsibleTrigger>
        <CollapsibleContent>
          <p className="pt-4">主题：跟随系统；圆角：0.625rem。</p>
        </CollapsibleContent>
      </Collapsible>
      {controlled && <p role="status">{open ? '已展开' : '已收起'}</p>}
    </div>
  );
}
const meta = {
  title: 'Components/Collapsible',
  component: Example,
  args: { defaultOpen: false, disabled: false, controlled: false },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: { description: { component: '单个可折叠区域。使用 render 组合按钮，支持默认展开、受控状态和禁用。' } },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '显示配置详情' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/主题：跟随系统/)).toBeVisible();
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  },
};
export const DefaultOpen: Story = { args: { defaultOpen: true } };
export const Controlled: Story = { args: { controlled: true } };
export const Disabled: Story = { args: { disabled: true } };
