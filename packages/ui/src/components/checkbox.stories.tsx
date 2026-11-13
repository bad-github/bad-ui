import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Checkbox } from './checkbox';
import { Field, FieldLabel, FieldDescription, FieldGroup } from './field';
function Example(args: ComponentProps<typeof Checkbox>) {
  const id = useId();
  return (
    <FieldGroup>
      <Field orientation="horizontal" data-invalid={args['aria-invalid']} data-disabled={args.disabled}>
        <Checkbox {...args} id={id} />
        <FieldLabel htmlFor={id}>接收版本更新通知</FieldLabel>
      </Field>
      <FieldDescription>仅在组件库发布新版本时通知。</FieldDescription>
    </FieldGroup>
  );
}
function ControlledExample() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Example checked={checked} onCheckedChange={setChecked} />
      <p role="status">{checked ? '已订阅' : '未订阅'}</p>
    </div>
  );
}
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { disabled: false },
  argTypes: {
    checked: { control: false },
    defaultChecked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-6">
        <Story />
      </div>
    ),
  ],
  render: (args) => <Example {...args} />,
  parameters: {
    docs: {
      description: {
        component: '支持受控与非受控勾选、禁用和混合状态。始终提供关联标签；indeterminate 需由调用方维护。',
      },
    },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const checkbox = canvas.getByRole('checkbox');
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(checkbox).not.toBeChecked();
  },
};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Invalid: Story = { args: { 'aria-invalid': true } };
export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('checkbox'));
    await expect(canvas.getByRole('status')).toHaveTextContent('已订阅');
  },
};
