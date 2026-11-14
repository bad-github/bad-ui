import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Switch } from './switch';
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from './field';
function Example({
  initial = false,
  disabled = false,
  invalid = false,
  size = 'default',
}: {
  initial?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  size?: 'default' | 'sm';
}) {
  const id = useId();
  const [checked, setChecked] = useState(initial);
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <Field orientation="horizontal" data-disabled={disabled} data-invalid={invalid}>
          <Switch
            id={id}
            size={size}
            checked={checked}
            onCheckedChange={setChecked}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
          />
          <FieldLabel htmlFor={id}>自动保存</FieldLabel>
        </Field>
        <FieldDescription id={`${id}-hint`}>开启后自动保存编辑内容，此示例仅更新本地状态。</FieldDescription>
        {invalid && <FieldError id={`${id}-error`}>当前设置无法保存，请稍后重试。</FieldError>}
      </FieldGroup>
      <p role="status" className="text-sm">
        自动保存：{checked ? '开启' : '关闭'}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Switch',
  component: Example,
  args: { initial: false, disabled: false, invalid: false, size: 'default' },
  argTypes: { size: { control: 'select', options: ['default', 'sm'] } },
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
        component: '即时切换设置的开关，支持受控状态、尺寸、禁用和错误状态。始终提供关联标签，支持点击与空格键操作。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('自动保存'));
    const control = canvas.getByRole('switch', { name: '自动保存' });
    await expect(control).toBeChecked();
    control.focus();
    await userEvent.keyboard(' ');
    await expect(control).not.toBeChecked();
  },
};
export const Checked: Story = { args: { initial: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, initial: true } };
export const Invalid: Story = { args: { invalid: true } };
