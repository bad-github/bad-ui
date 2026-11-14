import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from './popover';
import { Button } from './button';
import { Input } from './input';
import { FieldGroup, Field, FieldLabel } from './field';
function Example({
  form = false,
  controlled = false,
  disabled = false,
  side = 'bottom',
  align = 'center',
}: {
  form?: boolean;
  controlled?: boolean;
  disabled?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={disabled} render={<Button variant="outline" />}>
          打开设置
        </PopoverTrigger>
        <PopoverContent side={side} align={align} className="max-w-[calc(100vw-2rem)]">
          <PopoverHeader>
            <PopoverTitle>显示设置</PopoverTitle>
            <PopoverDescription>
              {form ? '填写名称后保存，仅更新当前示例。' : '设置适用于当前预览，可以随时关闭。'}
            </PopoverDescription>
          </PopoverHeader>
          {form ? (
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(name.trim());
                setOpen(false);
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={id}>显示名称</FieldLabel>
                  <Input
                    id={id}
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    required
                    pattern={String.raw`.*\S.*`}
                  />
                </Field>
              </FieldGroup>
              <Button type="submit">保存设置</Button>
            </form>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              关闭设置
            </Button>
          )}
        </PopoverContent>
      </Popover>
      <p role="status" className="text-sm">
        {saved ? `已保存：${saved}` : open ? '设置已打开' : '设置已关闭'}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Popover',
  component: Example,
  args: { form: false, controlled: false, disabled: false, side: 'bottom', align: 'center' },
  argTypes: {
    side: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
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
          '轻量弹层，组合 Trigger、Content、Header、Title 和 Description。支持方向、对齐和受控开关；Escape 关闭后恢复触发器焦点。复杂确认流程可使用 Dialog。',
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
    const trigger = canvas.getByRole('button', { name: '打开设置' });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole('dialog', { name: '显示设置' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
export const WithForm: Story = {
  args: { form: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '打开设置' }));
    const input = await body.findByRole('textbox', { name: '显示名称' });
    await userEvent.type(input, '组件预览');
    await userEvent.click(body.getByRole('button', { name: '保存设置' }));
    await waitFor(() => expect(body.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('已保存：组件预览');
  },
};
export const Top: Story = { args: { side: 'top' } };
export const StartAligned: Story = { args: { align: 'start' } };
export const Disabled: Story = { args: { disabled: true } };
export const Controlled: Story = {
  args: { controlled: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '外部打开' }));
    await waitFor(() => expect(body.getByRole('dialog', { name: '显示设置' })).toBeVisible());
    await userEvent.click(body.getByRole('button', { name: '关闭设置' }));
    await waitFor(() => expect(body.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('设置已关闭');
  },
};
