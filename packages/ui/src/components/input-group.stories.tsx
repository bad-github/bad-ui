import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { SearchIcon, KeyRoundIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from './input-group';
import { Field, FieldLabel, FieldDescription, FieldError } from './field';
function Example({
  kind = 'search',
  disabled = false,
  invalid = false,
}: {
  kind?: 'search' | 'url' | 'amount' | 'password' | 'textarea' | 'top';
  disabled?: boolean;
  invalid?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <Field data-invalid={invalid} data-disabled={disabled}>
        <FieldLabel htmlFor={id}>
          {kind === 'password'
            ? '密码'
            : kind === 'textarea'
              ? '项目说明'
              : kind === 'url'
                ? '网站地址'
                : kind === 'amount'
                  ? '金额'
                  : '搜索内容'}
        </FieldLabel>
        <InputGroup>
          {kind === 'textarea' ? (
            <InputGroupTextarea
              id={id}
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
              placeholder="请输入项目说明"
            />
          ) : (
            <InputGroupInput
              id={id}
              type={kind === 'password' && !show ? 'password' : kind === 'amount' ? 'number' : 'text'}
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
              placeholder={kind === 'url' ? 'example.com' : '请输入内容'}
            />
          )}
          <InputGroupAddon align={kind === 'textarea' ? 'block-end' : kind === 'top' ? 'block-start' : 'inline-start'}>
            {kind === 'textarea' ? (
              <InputGroupText>{value.length} 字符</InputGroupText>
            ) : kind === 'url' ? (
              <InputGroupText>https://</InputGroupText>
            ) : kind === 'amount' ? (
              <InputGroupText>¥</InputGroupText>
            ) : kind === 'password' ? (
              <KeyRoundIcon aria-hidden="true" />
            ) : (
              <SearchIcon aria-hidden="true" />
            )}
          </InputGroupAddon>
          {kind === 'password' ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                disabled={disabled}
                aria-label={show ? '隐藏密码' : '显示密码'}
                onClick={() => setShow((value) => !value)}
              >
                {show ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
              </InputGroupButton>
            </InputGroupAddon>
          ) : kind === 'amount' ? (
            <InputGroupAddon align="inline-end">
              <InputGroupText>CNY</InputGroupText>
            </InputGroupAddon>
          ) : kind === 'search' || kind === 'textarea' ? (
            <InputGroupAddon align={kind === 'textarea' ? 'block-end' : 'inline-end'}>
              <InputGroupButton
                disabled={disabled}
                onClick={() => {
                  if (value.trim()) setSent(value.trim());
                }}
              >
                {kind === 'textarea' ? '提交' : '搜索'}
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <FieldDescription id={`${id}-hint`}>
          {kind === 'password' ? '点击眼睛图标切换显示状态。' : '附加图标和操作与输入控件共享边框。'}
        </FieldDescription>
        {invalid && <FieldError id={`${id}-error`}>请检查输入内容</FieldError>}
      </Field>
      <p role="status">{sent ? `已提交：${sent}` : '尚未提交'}</p>
    </div>
  );
}
const meta = {
  title: 'Components/InputGroup',
  component: Example,
  args: { kind: 'search', disabled: false, invalid: false },
  argTypes: { kind: { control: 'select', options: ['search', 'url', 'amount', 'password', 'textarea', 'top'] } },
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
          '输入组合容器。内部使用 InputGroupInput 或 InputGroupTextarea；Addon 支持行首、行尾、顶部和底部布局。操作按钮需单独提供禁用状态及可访问名称。示例不会发起搜索或提交网络请求。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.type(canvas.getByRole('textbox', { name: '搜索内容' }), '设计规范');
    await userEvent.click(canvas.getByRole('button', { name: '搜索' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已提交：设计规范');
  },
};
export const URLPrefix: Story = { args: { kind: 'url' } };
export const Amount: Story = { args: { kind: 'amount' } };
export const PasswordVisibility: Story = {
  args: { kind: 'password' },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByLabelText('密码');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: '显示密码' }));
    await expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(canvas.getByRole('button', { name: '隐藏密码' }));
    await expect(input).toHaveAttribute('type', 'password');
  },
};
export const Textarea: Story = { args: { kind: 'textarea' } };
export const TopAddon: Story = { args: { kind: 'top' } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { invalid: true } };
