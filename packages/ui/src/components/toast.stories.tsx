import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Toaster, createToastManager } from './toast';
import { Button } from './button';
function Example({
  type = 'default',
  action = false,
}: {
  type?: 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';
  action?: boolean;
}) {
  const [manager] = useState(() => createToastManager());
  const [id, setId] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  return (
    <Toaster toastManager={manager} timeout={0}>
      <div className="flex flex-col items-start gap-4">
        <Button
          variant="outline"
          onClick={() =>
            setId(
              manager.add({
                title: type === 'loading' ? '正在保存' : '项目通知',
                description: '此通知仅用于组件演示，不会修改真实数据。',
                type,
                actionProps: action ? { children: '撤销', onClick: () => setRestored(true) } : undefined,
              })
            )
          }
        >
          显示通知
        </Button>
        {type === 'loading' && (
          <Button
            variant="outline"
            disabled={id === null}
            onClick={() => {
              if (id) manager.update(id, { title: '保存完成', type: 'success' });
            }}
          >
            完成保存
          </Button>
        )}
        <p role="status" className="text-sm">
          {restored ? '已撤销示例操作' : '通知由按钮触发，关闭后可再次显示。'}
        </p>
      </div>
    </Toaster>
  );
}
const meta = {
  title: 'Components/Toast',
  component: Example,
  args: { type: 'default', action: false },
  argTypes: { type: { control: 'select', options: ['default', 'success', 'info', 'warning', 'error', 'loading'] } },
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
          '轻量通知，Toaster 负责渲染通知列表。每个示例使用独立管理器，按钮触发后显示；timeout=0 保持通知供检查，使用关闭按钮移除。加载通知通过手动按钮更新，避免自动改变页面。',
      },
      story: { height: 420 },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '显示通知' }));
    await waitFor(() => expect(body.getByText('项目通知')).toBeVisible());
    await userEvent.hover(body.getByRole('dialog', { name: '项目通知' }));
    await userEvent.click(await body.findByRole('button', { name: 'Close toast' }));
    await waitFor(() => expect(body.queryByText('项目通知')).not.toBeInTheDocument(), { timeout: 3000 });
  },
};
export const Success: Story = { args: { type: 'success' } };
export const Info: Story = { args: { type: 'info' } };
export const Warning: Story = { args: { type: 'warning' } };
export const Error: Story = { args: { type: 'error' } };
export const WithAction: Story = {
  args: { action: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '显示通知' }));
    await userEvent.click(await body.findByRole('button', { name: '撤销' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已撤销示例操作');
  },
};
export const Loading: Story = {
  args: { type: 'loading' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '显示通知' }));
    await body.findByText('正在保存');
    await userEvent.click(canvas.getByRole('button', { name: '完成保存' }));
    await waitFor(() => expect(body.getByText('保存完成')).toBeVisible());
  },
};
