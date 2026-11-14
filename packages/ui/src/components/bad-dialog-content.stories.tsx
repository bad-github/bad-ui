import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { BadDialogContent, type BadDialogContentProps } from './bad-dialog-content';
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog';
import { Button } from './button';

function Example({ customContainer = false, ...args }: BadDialogContentProps & { customContainer?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {customContainer
          ? '弹窗和遮罩挂载到下方标记的 DOM 节点，仍沿用 fixed 定位。'
          : '不传 container，弹窗和遮罩默认挂载到当前文档的 body。'}
      </p>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>打开对话框</DialogTrigger>
        <BadDialogContent {...args} container={customContainer ? containerRef : undefined}>
          <DialogHeader>
            <DialogTitle>挂载容器示例</DialogTitle>
            <DialogDescription>
              {customContainer ? '内容位于自定义容器中，不代表只覆盖容器范围。' : '内容位于 document.body 下。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>关闭对话框</DialogClose>
          </DialogFooter>
        </BadDialogContent>
      </Dialog>
      {/* 直接传 ref，由 Portal 读取已挂载节点，无需用 Effect 将 DOM 节点复制进 state。 */}
      <div className="flex flex-col gap-2">
        <p className="text-sm">{customContainer ? '自定义挂载目标' : '未使用的对照节点'}</p>
        <div ref={containerRef} data-testid="portal-target" className="min-h-12 rounded-lg border border-dashed" />
      </div>
    </div>
  );
}

const meta = {
  title: 'Custom Components/BadDialogContent',
  component: BadDialogContent,
  args: { showCloseButton: true },
  argTypes: {
    container: {
      control: false,
      description: 'Portal 的挂载容器，可传 DOM 元素、ShadowRoot 或 ref；默认 document.body。',
    },
    showCloseButton: { control: 'boolean', description: '是否显示右上角关闭按钮。' },
    children: { control: false },
  },
  render: (args) => <Example {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg min-w-0 p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '复用 DialogContent 的样式、焦点与关闭行为，新增 container 属性。指定容器只改变 DOM 挂载位置，不改变定位方式；需与 Dialog、DialogTitle 一起使用。可打开浏览器 Elements 面板确认 Portal 的父节点。',
      },
    },
  },
} satisfies Meta<typeof BadDialogContent>;
export default meta;
type Story = StoryObj<typeof meta>;

function verifyContainer(custom: boolean): NonNullable<Story['play']> {
  return async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '打开对话框' });
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: '挂载容器示例' });
    const portal = dialog.closest('[data-slot="dialog-portal"]');
    const target = canvas.getByTestId('portal-target');
    await expect(portal).not.toBeNull();
    // 验证真实 DOM 归属，避免仅凭视觉位置误判挂载成功。
    await expect(portal?.parentElement).toBe(custom ? target : canvasElement.ownerDocument.body);
    await expect(portal?.querySelector('[data-slot="dialog-overlay"]')).toBeInTheDocument();
    if (custom) await userEvent.click(within(dialog).getByRole('button', { name: '关闭对话框' }));
    else await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  };
}

export const Default: Story = { play: verifyContainer(false) };
export const CustomContainer: Story = {
  render: (args) => <Example {...args} customContainer />,
  play: verifyContainer(true),
};
