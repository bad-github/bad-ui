import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, within, waitFor } from 'storybook/test';
import { Trash2Icon } from 'lucide-react';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogMedia,
} from './alert-dialog';
import { Button } from './button';

function ConfirmExample({
  size = 'default',
  media = false,
  disabled = false,
  onConfirm,
}: {
  size?: 'default' | 'sm';
  media?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger render={<Button variant="outline" />} disabled={disabled}>
          删除示例文件
        </AlertDialogTrigger>
        <AlertDialogContent size={size}>
          <AlertDialogHeader>
            {media && (
              <AlertDialogMedia>
                <Trash2Icon aria-hidden="true" />
              </AlertDialogMedia>
            )}
            <AlertDialogTitle>确认删除示例文件？</AlertDialogTitle>
            <AlertDialogDescription>这只是演示，不会删除真实文件。确认后将更新下方状态。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onConfirm();
                setConfirmed(true);
                setOpen(false);
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="text-sm text-muted-foreground">
        {confirmed ? '示例操作已确认' : '尚未确认删除'}
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/AlertDialog',
  component: ConfirmExample,
  subcomponents: {
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogMedia,
  },
  args: { size: 'default', media: false, disabled: false, onConfirm: fn() },
  argTypes: { size: { control: 'select', options: ['default', 'sm'] }, onConfirm: { control: false } },
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
          '需要明确确认的模态对话框。此示例通过 open / onOpenChange 受控；Action 是普通 Button，确认后需由调用方关闭。Cancel 自带关闭行为。通过 render 组合触发按钮，弹层包含可访问标题和说明。',
      },
    },
  },
} satisfies Meta<typeof ConfirmExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '删除示例文件' });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const dialog = await body.findByRole('alertdialog');
    await expect(dialog).toHaveAccessibleName('确认删除示例文件？');
    await userEvent.click(within(dialog).getByRole('button', { name: '取消' }));
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(args.onConfirm).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    await userEvent.click(within(await body.findByRole('alertdialog')).getByRole('button', { name: '确认删除' }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
    await expect(canvas.getByRole('status')).toHaveTextContent('示例操作已确认');
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
  },
};
export const Small: Story = { args: { size: 'sm' } };
export const WithMedia: Story = { args: { media: true } };
export const SmallWithMedia: Story = { args: { size: 'sm', media: true } };
export const DisabledTrigger: Story = { args: { disabled: true } };
export const Keyboard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '删除示例文件' });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('alertdialog');
    const cancel = within(dialog).getByRole('button', { name: '取消' });
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.tab();
    await expect(within(dialog).getByRole('button', { name: '确认删除' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('alertdialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
