import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from './sheet';
import { Button } from './button';
import { Input } from './input';
import { FieldGroup, Field, FieldLabel } from './field';
function Example({
  side = 'right',
  form = false,
  controlled = false,
}: {
  side?: 'top' | 'right' | 'bottom' | 'left';
  form?: boolean;
  controlled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState('');
  return (
    <div className="flex flex-col items-start gap-4">
      {controlled && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          外部打开
        </Button>
      )}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="outline" />}>打开面板</SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>项目设置</SheetTitle>
            <SheetDescription>查看或编辑当前项目，此示例不发送网络请求。</SheetDescription>
          </SheetHeader>
          {form ? (
            <form
              className="flex min-h-0 flex-1 flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(name);
                setOpen(false);
              }}
            >
              <FieldGroup className="px-4">
                <Field>
                  <FieldLabel htmlFor={id}>项目名称</FieldLabel>
                  <Input id={id} value={name} onChange={(event) => setName(event.currentTarget.value)} required />
                </Field>
              </FieldGroup>
              <SheetFooter>
                <Button type="submit">保存设置</Button>
              </SheetFooter>
            </form>
          ) : (
            <>
              <p className="px-4 text-sm">可以从侧边面板查看项目详情，也可以按 Escape 关闭。</p>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>关闭面板</SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
      <p role="status" className="text-sm">
        {saved ? `已保存：${saved}` : open ? '面板已打开' : '面板已关闭'}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Sheet',
  component: Example,
  args: { side: 'right', form: false, controlled: false },
  argTypes: { side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] } },
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
          '基于 Dialog 的边缘面板，支持四个方向、受控开关和表单。始终提供 SheetTitle 与 Description；关闭后焦点返回触发器。表单内容保持在弹层内部。',
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
    const trigger = canvas.getByRole('button', { name: '打开面板' });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole('dialog', { name: '项目设置' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const Left: Story = { args: { side: 'left' } };
export const Top: Story = { args: { side: 'top' } };
export const Bottom: Story = { args: { side: 'bottom' } };
export const WithForm: Story = {
  args: { form: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '打开面板' }));
    await userEvent.type(await body.findByRole('textbox', { name: '项目名称' }), '组件文档');
    await userEvent.click(body.getByRole('button', { name: '保存设置' }));
    await waitFor(() => expect(body.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('已保存：组件文档');
  },
};
export const Controlled: Story = { args: { controlled: true } };
