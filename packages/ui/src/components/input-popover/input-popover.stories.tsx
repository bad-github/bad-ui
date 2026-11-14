import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../../.storybook/testing/interaction-mode';
import { InputPopover, type InputPopoverProps, type InputPopoverContentContext } from './index';
import { Button } from '../button';
import { Input } from '../input';
import { Field, FieldLabel } from '../field';

const people = [
  { name: '张三', role: '前端工程师' },
  { name: '张晓', role: '产品设计师' },
  { name: '李四', role: '后端工程师' },
  { name: '王五', role: '产品经理' },
];
function PeopleContent({ value, setValue, close }: InputPopoverContentContext) {
  const matches = people.filter((person) => `${person.name}${person.role}`.includes(value));
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">用户卡片</h3>
      <p className="text-sm break-words text-muted-foreground">内容收到的输入：{value || '（空）'}</p>
      <div className="grid grid-cols-2 gap-2">
        {matches.map((person) => (
          <Button
            type="button"
            variant="outline"
            key={person.name}
            className="h-auto min-w-0 flex-col items-start gap-1 p-3"
            onClick={() => {
              setValue(person.name);
              close();
            }}
          >
            <span>{person.name}</span>
            <span className="text-xs text-muted-foreground">{person.role}</span>
          </Button>
        ))}
      </div>
      {!matches.length && <p className="text-sm text-muted-foreground">没有匹配的用户，可修改输入或关闭面板。</p>}
      <Button type="button" variant="ghost" onClick={close}>
        关闭面板
      </Button>
    </div>
  );
}

function Example(args: InputPopoverProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-4">
      {/* 放在输入框上方，避免被默认向下展开的面板遮挡，便于手动测试外部关闭。 */}
      <Button type="button" variant="outline" className="self-start">
        外部点击关闭弹层
      </Button>
      <Field>
        <FieldLabel htmlFor={id}>搜索用户</FieldLabel>
        <InputPopover {...args} id={id} />
      </Field>
    </div>
  );
}
const meta = {
  title: 'Custom Components/InputPopover',
  component: InputPopover,
  args: {
    placeholder: '输入姓名或岗位',
    defaultValue: '',
    disabled: false,
    readOnly: false,
    renderContent: (context) => <PeopleContent {...context} />,
    onValueChange: fn(),
    onSearch: fn(),
    onOpenChange: fn(),
    onChange: fn(),
  },
  argTypes: {
    value: { control: false, description: '受控字符串，配合 onValueChange 或 onChange 更新。' },
    defaultValue: { control: 'text' },
    open: { control: false, description: '受控开关，配合 onOpenChange 更新。' },
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    renderContent: { control: false, description: '接收 value、setValue、close，返回任意 React 内容。' },
    contentClassName: { control: 'text' },
    contentLabel: { control: 'text' },
    contentProps: { control: false },
    onValueChange: { control: false },
    onChange: { control: false },
    onSearch: { control: false },
    onOpenChange: { control: false },
  },
  render: (args) => <Example key={`${args.defaultValue}-${args.defaultOpen}`} {...args} />,
  decorators: [
    (Story) => (
      // 全局预览容器默认垂直居中；此处靠上展示，为弹层在小屏幕上向下展开预留空间。
      <div className="w-full max-w-lg min-w-0 self-start p-6 pt-2">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '输入框驱动自定义 Popover 内容，不限定列表。内容接收实时 value，通过 setValue 回填、close 关闭；两者互相独立。onSearch 排除输入法组合草稿，setValue 不伪造原生事件也不触发搜索。非模态面板打开时保持输入焦点，使用向下键进入内容。',
      },
    },
  },
} satisfies Meta<typeof InputPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('combobox', { name: '搜索用户' });
    await userEvent.click(input);
    const body = within(canvasElement.ownerDocument.body);
    const panel = await body.findByRole('dialog', { name: '输入辅助面板' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, '张');
    await expect(within(panel).getByText('内容收到的输入：张')).toBeVisible();
    await expect(within(panel).queryByRole('button', { name: /李四/ })).not.toBeInTheDocument();
    await userEvent.click(within(panel).getByRole('button', { name: /张三/ }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(input).toHaveValue('张三');
    await expect(input).toHaveFocus();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('张三');
    // 回填不伪造输入事件，也不重新搜索刚选定的值。
    await expect(args.onSearch).toHaveBeenCalledOnce();
    await expect(args.onSearch).toHaveBeenLastCalledWith('张');
  },
};

function EditorPanel({ value, setValue, close }: InputPopoverContentContext) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor={id}>面板备注</FieldLabel>
        <Input id={id} value={draft} onChange={(event) => setDraft(event.currentTarget.value)} />
      </Field>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => {
            setValue(draft);
            close();
          }}
        >
          保存并回填
        </Button>
        <Button type="button" variant="outline" onClick={close}>
          取消编辑
        </Button>
      </div>
    </div>
  );
}
export const EditorContent: Story = {
  args: { renderContent: (context) => <EditorPanel {...context} /> },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('combobox', { name: '搜索用户' });
    await userEvent.click(input);
    const body = within(canvasElement.ownerDocument.body);
    const editor = await body.findByRole('textbox', { name: '面板备注' });
    await userEvent.type(editor, '任意表单内容');
    await expect(editor).toHaveFocus();
    await userEvent.click(body.getByRole('button', { name: '保存并回填' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(input).toHaveValue('任意表单内容');
  },
};

export const KeyboardAndDismiss: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('combobox', { name: '搜索用户' });
    input.focus();
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');
    await userEvent.keyboard('{ArrowDown}');
    await expect(body.getByRole('dialog')).toHaveFocus();
    await userEvent.tab();
    await expect(body.getByRole('button', { name: /张三/ })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(input).toHaveFocus();
    await userEvent.click(input);
    await body.findByRole('dialog');
    const outside = canvas.getByRole('button', { name: '外部点击关闭弹层' });
    await userEvent.click(outside);
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(outside).toHaveFocus();
  },
};

function ControlledExample(args: InputPopoverProps) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      {/* 状态和外部操作放在输入框上方，面板打开时仍能查看与点击。 */}
      <p className="text-sm">
        受控值：{value || '（空）'}；面板：{open ? '打开' : '关闭'}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setValue('外部重置');
          setOpen(false);
        }}
      >
        外部重置
      </Button>
      <Example
        {...args}
        value={value}
        open={open}
        onValueChange={(next) => {
          setValue(next);
          args.onValueChange?.(next);
        }}
        onOpenChange={(next) => {
          setOpen(next);
          args.onOpenChange?.(next);
        }}
      />
    </div>
  );
}
export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('combobox', { name: '搜索用户' });
    await userEvent.type(input, '张');
    await expect(input).toHaveValue('张');
    await userEvent.click(canvas.getByRole('button', { name: '外部重置' }));
    await expect(input).toHaveValue('外部重置');
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const SearchEvents: Story = {
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('combobox', { name: '搜索用户' });
    await userEvent.click(input);
    fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: 'ni' }, isComposing: true });
    await expect(input).toHaveValue('ni');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('ni');
    await expect(args.onSearch).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { data: '你', target: { value: '你' } });
    fireEvent.input(input, { target: { value: '你' }, isComposing: false });
    await expect(args.onSearch).toHaveBeenCalledOnce();
    await expect(args.onSearch).toHaveBeenLastCalledWith('你');
  },
};
export const Disabled: Story = {
  args: { disabled: true, defaultOpen: true },
  play: async ({ canvas, canvasElement }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('combobox')).toBeDisabled();
    await expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).not.toBeInTheDocument();
  },
};
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: '只读内容' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);
    await expect(input).toHaveAttribute('readonly');
    await expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const DefaultOpen: Story = {
  args: { defaultOpen: true, defaultValue: '张' },
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');
    const input = canvas.getByRole('combobox', { name: '搜索用户' });
    await userEvent.click(body.getByRole('button', { name: '关闭面板' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    // close 只关闭，原输入值不变；恢复输入焦点不会立即重新打开面板。
    await expect(input).toHaveValue('张');
    await expect(input).toHaveFocus();
    await expect(args.onOpenChange).toHaveBeenCalledOnce();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await userEvent.click(input);
    await body.findByRole('dialog');
    await userEvent.click(input);
    await expect(body.getByRole('dialog')).toBeInTheDocument();
    await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  },
};
