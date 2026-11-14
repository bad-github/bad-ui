import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { cn } from 'cn';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { FieldSet, FieldLegend, FieldGroup, Field, FieldLabel, FieldDescription, FieldError } from './field';
function Example({
  initial = '',
  disabled = false,
  invalid = false,
  horizontal = false,
  disabledOption = false,
}: {
  initial?: string;
  disabled?: boolean;
  invalid?: boolean;
  horizontal?: boolean;
  disabledOption?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <FieldSet>
          <FieldLegend id={`${id}-title`}>通知频率</FieldLegend>
          <FieldDescription id={`${id}-hint`}>选择接收版本更新通知的频率。</FieldDescription>
          <RadioGroup
            value={value}
            onValueChange={(next) => setValue(String(next))}
            disabled={disabled}
            aria-labelledby={`${id}-title`}
            aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
            aria-invalid={invalid || undefined}
            className={cn(horizontal && 'flex flex-wrap gap-4')}
          >
            {['每次更新', '每周摘要', '不接收'].map((label, index) => (
              <Field
                key={label}
                orientation="horizontal"
                className={cn(horizontal && 'w-auto')}
                data-invalid={invalid}
                data-disabled={disabled || (disabledOption && index === 2)}
              >
                <RadioGroupItem
                  id={`${id}-${index}`}
                  value={label}
                  disabled={disabledOption && index === 2}
                  aria-invalid={invalid || undefined}
                />
                <FieldLabel htmlFor={`${id}-${index}`}>{label}</FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          {invalid && <FieldError id={`${id}-error`}>请选择有效的通知频率。</FieldError>}
        </FieldSet>
      </FieldGroup>
      <p role="status" className="text-sm">
        {value ? `当前选择：${value}` : '尚未选择'}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/RadioGroup',
  component: Example,
  args: { initial: '', disabled: false, invalid: false, horizontal: false, disabledOption: false },
  argTypes: { initial: { control: 'select', options: ['', '每次更新', '每周摘要', '不接收'] } },
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
          '互斥单选组，使用 FieldSet、FieldLegend 与关联标签提供语义。示例为受控状态，点击标签或用方向键切换选项；支持整组禁用、单项禁用与错误状态。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('每次更新'));
    const first = canvas.getByRole('radio', { name: '每次更新' });
    await expect(first).toBeChecked();
    first.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: '每周摘要' })).toBeChecked();
    await expect(first).not.toBeChecked();
    await expect(canvas.getByRole('status')).toHaveTextContent('当前选择：每周摘要');
  },
};
export const Preselected: Story = { args: { initial: '每周摘要' } };
export const Horizontal: Story = { args: { horizontal: true } };
export const Disabled: Story = { args: { disabled: true, initial: '每周摘要' } };
export const Invalid: Story = { args: { invalid: true } };
export const DisabledOption: Story = { args: { disabledOption: true } };
