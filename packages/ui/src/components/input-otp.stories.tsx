import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './input-otp';
import { Field, FieldLabel, FieldDescription, FieldError } from './field';
import { Button } from './button';
function Example({
  length = 6,
  separated = false,
  disabled = false,
  invalid = false,
  alphanumeric = false,
  initial = false,
}: {
  length?: number;
  separated?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  alphanumeric?: boolean;
  initial?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(initial ? '123456'.slice(0, length) : '');
  const splitIndex = Math.ceil(length / 2);
  const slots = (start: number, count: number) =>
    Array.from({ length: count }, (_, index) => (
      <InputOTPSlot key={start + index} index={start + index} aria-invalid={invalid} />
    ));
  return (
    <div className="flex flex-col gap-4">
      <Field data-disabled={disabled} data-invalid={invalid}>
        <FieldLabel htmlFor={id}>验证码</FieldLabel>
        <InputOTP
          id={id}
          maxLength={length}
          value={value}
          onChange={setValue}
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={`${id}-hint${invalid ? ' ' + id + '-error' : ''}`}
          inputMode={alphanumeric ? 'text' : 'numeric'}
          pattern={alphanumeric ? REGEXP_ONLY_DIGITS_AND_CHARS : REGEXP_ONLY_DIGITS}
          containerClassName="gap-2"
        >
          {separated ? (
            <>
              <InputOTPGroup>{slots(0, splitIndex)}</InputOTPGroup>
              <InputOTPSeparator aria-hidden="true" />
              <InputOTPGroup>{slots(splitIndex, length - splitIndex)}</InputOTPGroup>
            </>
          ) : (
            <InputOTPGroup>{slots(0, length)}</InputOTPGroup>
          )}
        </InputOTP>
        <FieldDescription id={`${id}-hint`}>
          {alphanumeric ? '允许英文字母与数字。' : `请输入 ${length} 位数字。`}
        </FieldDescription>
        {invalid && <FieldError id={`${id}-error`}>验证码无效，请重新输入</FieldError>}
      </Field>
      <p role="status">{value.length === length ? '输入完成' : `已输入 ${value.length} / ${length} 位`}</p>
      <Button variant="outline" disabled={!value || disabled} onClick={() => setValue('')}>
        清空验证码
      </Button>
    </div>
  );
}
const meta = {
  title: 'Components/InputOTP',
  component: Example,
  args: { length: 6, separated: false, disabled: false, invalid: false, alphanumeric: false, initial: false },
  argTypes: { length: { control: 'select', options: [4, 6] } },
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
          '基于 input-otp，以一个真实输入控件管理多个视觉槽位，支持输入、粘贴和键盘编辑。示例用受控状态限制长度和字符模式；“输入完成”只表示位数足够，不代表验证码验证成功。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '验证码' });
    await userEvent.type(input, '123456');
    await expect(input).toHaveValue('123456');
    await expect(canvas.getByRole('status')).toHaveTextContent('输入完成');
    await userEvent.click(canvas.getByRole('button', { name: '清空验证码' }));
    await expect(input).toHaveValue('');
  },
};
export const FourDigits: Story = { args: { length: 4 } };
export const Separated: Story = { args: { separated: true } };
export const WithDefaultValue: Story = { args: { initial: true } };
export const Disabled: Story = { args: { disabled: true, initial: true } };
export const Invalid: Story = { args: { invalid: true } };
export const Alphanumeric: Story = {
  args: { alphanumeric: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '验证码' });
    await userEvent.type(input, 'AB12CD');
    await expect(input).toHaveValue('AB12CD');
  },
};
