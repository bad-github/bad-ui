import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId } from 'react';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Label } from './label';
import { Input } from './input';
import { Checkbox } from './checkbox';
import { Switch } from './switch';
import { Field, FieldDescription, FieldGroup } from './field';

function InputExample({
  labelProps,
  disabled = false,
  required = false,
  description = false,
}: {
  labelProps: ComponentProps<typeof Label>;
  disabled?: boolean;
  required?: boolean;
  description?: boolean;
}) {
  const id = useId();
  return (
    <FieldGroup>
      <Field data-disabled={disabled}>
        <Label {...labelProps} htmlFor={id}>
          {labelProps.children}
          {required && <span>（必填）</span>}
        </Label>
        <Input
          id={id}
          placeholder="请输入显示名称"
          disabled={disabled}
          required={required}
          aria-describedby={description ? `${id}-description` : undefined}
        />
        {description && <FieldDescription id={`${id}-description`}>显示名称会出现在个人资料中。</FieldDescription>}
      </Field>
    </FieldGroup>
  );
}

function ToggleExample({
  labelProps,
  kind,
}: {
  labelProps: ComponentProps<typeof Label>;
  kind: 'checkbox' | 'switch';
}) {
  const id = useId();
  return (
    <FieldGroup>
      <Field orientation="horizontal">
        {kind === 'checkbox' ? <Checkbox id={id} /> : <Switch id={id} />}
        <Label {...labelProps} htmlFor={id} />
      </Field>
    </FieldGroup>
  );
}

const meta = {
  title: 'Components/Label',
  component: Label,
  args: { children: '显示名称' },
  argTypes: {
    children: { control: 'text', description: '控件的可见标签文本。' },
    htmlFor: { control: false, description: '关联控件的 id。示例使用 useId 自动生成。' },
  },
  render: (args) => <InputExample labelProps={args} />,
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
          '原生 label 的样式封装，通过 htmlFor 与控件 id 建立关联，点击标签可聚焦或切换控件。Label 本身没有 disabled 或 required 属性，需在控件上设置；禁用样式由外层 group 的 data-disabled 或 peer-disabled 驱动。完整表单可使用 FieldLabel、FieldDescription 和 FieldError。',
      },
    },
  },
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('显示名称'));
    const input = canvas.getByRole('textbox', { name: '显示名称' });
    await expect(input).toHaveFocus();
    await userEvent.type(input, '组件使用者');
    await expect(input).toHaveValue('组件使用者');
  },
};

export const WithDescription: Story = {
  render: (args) => <InputExample labelProps={args} description />,
};

export const Required: Story = {
  render: (args) => <InputExample labelProps={args} required />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: /显示名称.*必填/ });
    await expect(input).toBeRequired();
    await expect(input).toBeInvalid();
    await userEvent.type(input, '组件使用者');
    await expect(input).toBeValid();
  },
};

export const Disabled: Story = {
  render: (args) => <InputExample labelProps={args} disabled />,
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('textbox', { name: '显示名称' })).toBeDisabled();
  },
};

export const WithCheckbox: Story = {
  args: { children: '接收版本更新通知' },
  render: (args) => <ToggleExample labelProps={args} kind="checkbox" />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('接收版本更新通知'));
    const checkbox = canvas.getByRole('checkbox', { name: '接收版本更新通知' });
    await expect(checkbox).toBeChecked();
    await userEvent.click(canvas.getByText('接收版本更新通知'));
    await expect(checkbox).not.toBeChecked();
  },
};

export const WithSwitch: Story = {
  args: { children: '启用自动保存' },
  render: (args) => <ToggleExample labelProps={args} kind="switch" />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('启用自动保存'));
    await expect(canvas.getByRole('switch', { name: '启用自动保存' })).toBeChecked();
  },
};
