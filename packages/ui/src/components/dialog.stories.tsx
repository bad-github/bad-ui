import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Field, FieldLabel, FieldGroup } from './field';
function Example({ disabled = false, hideClose = false, long = false, form = false }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState('');
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger disabled={disabled} render={<Button variant="outline" />}>
          打开对话框
        </DialogTrigger>
        <DialogContent showCloseButton={!hideClose}>
          <DialogHeader>
            <DialogTitle>{form ? '编辑项目名称' : '项目说明'}</DialogTitle>
            <DialogDescription>这是一个可关闭的示例弹窗，不会修改真实项目。</DialogDescription>
          </DialogHeader>
          {form ? (
            <form
              id={id}
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(String(new FormData(event.currentTarget).get('name')));
                setOpen(false);
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${id}-name`}>项目名称</FieldLabel>
                  <Input id={`${id}-name`} name="name" defaultValue="bad-ui" required />
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <div
              className="max-h-64 overflow-y-auto"
              tabIndex={long ? 0 : undefined}
              role={long ? 'region' : undefined}
              aria-label={long ? '项目说明正文' : undefined}
            >
              {Array.from({ length: long ? 12 : 1 }, (_, index) => (
                <p key={index} className="mb-3">
                  在发布前检查组件的样式、主题、键盘操作和可访问名称。
                </p>
              ))}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            {form ? (
              <Button type="submit" form={id}>
                保存
              </Button>
            ) : (
              <DialogClose render={<Button />}>我知道了</DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p role="status">{saved ? `已保存：${saved}` : '尚未保存修改'}</p>
    </div>
  );
}
const meta = {
  title: 'Components/Dialog',
  component: Example,
  args: { disabled: false, hideClose: false, long: false, form: false },
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
          '模态对话框，组合 Trigger、Content、Title、Description 与 Close。示例受控管理开关；表单提交只更新示例状态。支持 Escape 关闭和焦点恢复。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '打开对话框' });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog', { name: '项目说明' })).toBeVisible());
    await userEvent.click(body.getByRole('button', { name: '我知道了' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 5000 });
    await expect(trigger).toHaveFocus();
  },
};
export const Form: Story = {
  args: { form: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '打开对话框' }));
    const body = within(canvasElement.ownerDocument.body);
    const input = await body.findByRole('textbox', { name: '项目名称' });
    await userEvent.clear(input);
    await userEvent.type(input, '组件文档');
    await userEvent.click(body.getByRole('button', { name: '保存' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 5000 });
    await expect(canvas.getByRole('status')).toHaveTextContent('已保存：组件文档');
  },
};
export const LongContent: Story = { args: { long: true } };
export const WithoutCornerClose: Story = { args: { hideClose: true } };
export const DisabledTrigger: Story = { args: { disabled: true } };
export const Keyboard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '打开对话框' });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 5000 });
    await expect(trigger).toHaveFocus();
  },
};
