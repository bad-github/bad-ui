import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from './native-select';
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from './field';

function Example({
  size = 'default',
  disabled = false,
  invalid = false,
  grouped = false,
  required = false,
  initial = '',
  disabledOptions = false,
}: {
  size?: 'default' | 'sm';
  disabled?: boolean;
  invalid?: boolean;
  grouped?: boolean;
  required?: boolean;
  initial?: string;
  disabledOptions?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const options = (
    <>
      <NativeSelectOption value="reader">只读成员</NativeSelectOption>
      <NativeSelectOption value="editor">编辑成员</NativeSelectOption>
      <NativeSelectOption value="admin" disabled={disabledOptions}>
        管理员{disabledOptions ? '（不可用）' : ''}
      </NativeSelectOption>
    </>
  );
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-disabled={disabled} data-invalid={invalid}>
          <FieldLabel htmlFor={id}>项目角色{required ? '（必填）' : ''}</FieldLabel>
          <NativeSelect
            className="w-full"
            id={id}
            size={size}
            disabled={disabled}
            required={required}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
          >
            <NativeSelectOption value="" disabled>
              请选择角色
            </NativeSelectOption>
            {grouped ? (
              <>
                <NativeSelectOptGroup label="项目成员">{options}</NativeSelectOptGroup>
                <NativeSelectOptGroup label="外部协作" disabled={disabledOptions}>
                  <NativeSelectOption value="guest">访客</NativeSelectOption>
                  <NativeSelectOption value="reviewer">审阅者</NativeSelectOption>
                </NativeSelectOptGroup>
              </>
            ) : (
              options
            )}
          </NativeSelect>
          <FieldDescription id={`${id}-hint`}>角色决定项目内的操作权限；此示例仅更新本地选择。</FieldDescription>
          {invalid && <FieldError id={`${id}-error`}>当前角色不可用，请重新选择。</FieldError>}
        </Field>
      </FieldGroup>
      <p role="status" className="text-sm">
        {value
          ? `当前角色：${{ reader: '只读成员', editor: '编辑成员', admin: '管理员', guest: '访客', reviewer: '审阅者' }[value] ?? value}`
          : '尚未选择角色'}
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/NativeSelect',
  component: Example,
  args: {
    size: 'default',
    disabled: false,
    invalid: false,
    grouped: false,
    required: false,
    initial: '',
    disabledOptions: false,
  },
  argTypes: {
    size: { control: 'select', options: ['default', 'sm'] },
    initial: { control: 'select', options: ['', 'reader', 'editor', 'admin'] },
  },
  render: (args) => <Example key={args.initial} {...args} />,
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
          '带统一样式的原生 select，选项弹层与键盘操作由浏览器提供。支持尺寸、分组、禁用及原生必填校验；size 是视觉尺寸，不是原生 select 的可见行数。使用关联标签提供可访问名称，错误状态同时设置 Field 的 data-invalid 和控件的 aria-invalid。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const select = canvas.getByRole('combobox', { name: '项目角色' });
    await userEvent.selectOptions(select, 'editor');
    await expect(select).toHaveValue('editor');
    await expect(canvas.getByRole('status')).toHaveTextContent('当前角色：编辑成员');
  },
};
export const WithInitialValue: Story = { args: { initial: 'editor' } };
export const Small: Story = { args: { size: 'sm' } };
export const Grouped: Story = { args: { grouped: true } };
export const Disabled: Story = {
  args: { disabled: true, initial: 'reader' },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('combobox', { name: '项目角色' })).toBeDisabled();
  },
};
export const DisabledOptions: Story = {
  args: { disabledOptions: true, grouped: true },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('option', { name: '管理员（不可用）' })).toBeDisabled();
    await expect(canvas.getByRole('group', { name: '外部协作' })).toBeDisabled();
  },
};
export const Invalid: Story = { args: { invalid: true, initial: 'admin' } };
export const Required: Story = {
  args: { required: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const select = canvas.getByRole('combobox', { name: /项目角色.*必填/ });
    await expect(select).toBeRequired();
    await expect(select).toBeInvalid();
    await userEvent.selectOptions(select, 'reader');
    await expect(select).toBeValid();
  },
};
