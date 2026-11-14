import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select';
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from './field';
function Example({
  initial = null,
  disabled = false,
  invalid = false,
  grouped = false,
  size = 'default',
}: {
  initial?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  grouped?: boolean;
  size?: 'default' | 'sm';
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const items = [
    { value: 'reader', label: '只读成员' },
    { value: 'editor', label: '编辑成员' },
    { value: 'admin', label: '管理员' },
  ];
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-disabled={disabled} data-invalid={invalid}>
          <FieldLabel htmlFor={id}>项目角色</FieldLabel>
          <Select items={items} value={value} onValueChange={setValue} disabled={disabled}>
            <SelectTrigger
              id={id}
              size={size}
              className="w-full"
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
            >
              <SelectValue placeholder="请选择角色" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {grouped && <SelectLabel>项目成员</SelectLabel>}
                <SelectItem value="reader">只读成员</SelectItem>
                <SelectItem value="editor">编辑成员</SelectItem>
              </SelectGroup>
              {grouped && <SelectSeparator />}
              <SelectGroup>
                {grouped && <SelectLabel>管理权限</SelectLabel>}
                <SelectItem value="admin" disabled>
                  管理员
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription id={`${id}-hint`}>管理员选项暂不可用，此示例仅更新本地状态。</FieldDescription>
          {invalid && <FieldError id={`${id}-error`}>请选择有效的角色。</FieldError>}
        </Field>
      </FieldGroup>
      <p role="status" className="text-sm">
        {value ? `已选择：${items.find((item) => item.value === value)?.label}` : '尚未选择'}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Select',
  component: Example,
  args: { initial: null, disabled: false, invalid: false, grouped: false, size: 'default' },
  argTypes: {
    initial: { control: 'select', options: [null, 'reader', 'editor'] },
    size: { control: 'select', options: ['default', 'sm'] },
  },
  render: (args) => <Example key={String(args.initial)} {...args} />,
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
          '自定义选择器，支持受控值、占位、选项分组、禁用项和错误状态。SelectItem 始终放在 SelectGroup 中，items 提供值到显示文字的映射。原生表单选择可使用 NativeSelect。',
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
    await userEvent.click(canvas.getByRole('combobox', { name: '项目角色' }));
    const option = await body.findByRole('option', { name: '编辑成员' });
    await waitFor(() => expect(option).toBeVisible());
    await userEvent.keyboard('{Home}{ArrowDown}{Enter}');
    await waitFor(() => expect(body.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('已选择：编辑成员');
  },
};
export const WithInitialValue: Story = { args: { initial: 'reader' } };
export const Grouped: Story = { args: { grouped: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true, initial: 'reader' } };
export const Invalid: Story = { args: { invalid: true } };
