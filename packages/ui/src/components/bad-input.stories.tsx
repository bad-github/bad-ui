import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useRef, useState } from 'react';
import { expect, fn, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { BadInput, type BadInputProps, type BadInputHandle } from './bad-input';
import { Input } from './input';
import { Button } from './button';
import { Field, FieldLabel, FieldDescription } from './field';

function ValueExample({ controlled = false, ...args }: BadInputProps & { controlled?: boolean }) {
  const id = useId();
  const [value, setValue] = useState(String(args.defaultValue ?? ''));
  const [changes, setChanges] = useState(0);
  const [valueChanges, setValueChanges] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor={id}>输入内容</FieldLabel>
        <BadInput
          {...args}
          id={id}
          value={controlled ? value : undefined}
          defaultValue={controlled ? undefined : args.defaultValue}
          onChange={(event) => {
            // 受控时由调用方更新 value；非受控时仅记录显示值，输入仍交给底层管理。
            setValue(event.currentTarget.value);
            setChanges((count) => count + 1);
            args.onChange?.(event);
          }}
          onValueChange={(next, details) => {
            setValueChanges((count) => count + 1);
            args.onValueChange?.(next, details);
          }}
        />
        <FieldDescription>输入或点击清空，观察两种回调是否都收到变化；清空后焦点回到输入框。</FieldDescription>
      </Field>
      <p className="text-sm break-words">当前值：{value || '（空）'}</p>
      <p className="text-sm text-muted-foreground">
        onChange：{changes} 次；onValueChange：{valueChanges} 次
      </p>
      {controlled && (
        <Button variant="outline" onClick={() => setValue('外部重置值')}>
          外部重置
        </Button>
      )}
    </div>
  );
}

function ComparisonExample() {
  const id = useId();
  const [plain, setPlain] = useState('示例内容');
  const [enhanced, setEnhanced] = useState('示例内容');
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        两侧输入值独立。普通 Input 只提供输入；BadInput 开启 allowClear
        后提供清空按钮。可分别编辑，再点击右侧清空，观察内容和焦点。
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${id}-plain`}>Input</FieldLabel>
          <Input id={`${id}-plain`} value={plain} onChange={(event) => setPlain(event.currentTarget.value)} />
          <FieldDescription>原有输入框，无内置清空按钮。</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-enhanced`}>BadInput</FieldLabel>
          <BadInput
            id={`${id}-enhanced`}
            value={enhanced}
            onChange={(event) => setEnhanced(event.currentTarget.value)}
            allowClear
          />
          <FieldDescription>有值时显示清空按钮，空值时自动隐藏。</FieldDescription>
        </Field>
      </div>
      <Button
        variant="outline"
        className="self-start"
        onClick={() => {
          setPlain('示例内容');
          setEnhanced('示例内容');
        }}
      >
        重置两侧内容
      </Button>
    </div>
  );
}

const meta = {
  title: 'Custom Components/BadInput',
  component: BadInput,
  args: {
    defaultValue: '示例内容',
    allowClear: true,
    loading: false,
    disabled: false,
    readOnly: false,
    onChange: fn(),
    onValueChange: fn(),
    onShowPasswordChange: fn(),
  },
  argTypes: {
    loading: { control: 'boolean', description: '仅显示加载状态，不自动禁用输入；优先隐藏密码显隐和清空按钮。' },
    allowClear: { control: 'boolean', description: '非密码输入有值时显示清空按钮。' },
    type: { control: 'select', options: ['text', 'password', 'email', 'search'] },
    defaultValue: { control: 'text', description: '非受控初始值。' },
    value: { control: false, description: '受控值，需配合 onChange 或 onValueChange 更新。' },
    showPassword: { control: 'boolean', description: '密码显隐受控状态；不传时内部管理。' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    onChange: { control: false },
    onValueChange: { control: false },
    onShowPasswordChange: { control: false },
  },
  render: (args) => <ValueExample key={String(args.defaultValue)} {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '基于 InputGroup 和 Input 的增强输入框。增加清空、密码显隐、加载状态及 ref 操作；className 和 style 作用于外层容器。右侧优先级为 loading > 密码显隐 > 清空。以下示例可直接操作，观察与原始 Input 的区别。',
      },
    },
  },
} satisfies Meta<typeof BadInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Input vs BadInput',
  render: () => <ComparisonExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: 'Clear input' }));
    await expect(canvas.getByRole('textbox', { name: 'BadInput' })).toHaveValue('');
    await expect(canvas.getByRole('textbox', { name: 'BadInput' })).toHaveFocus();
    await expect(canvas.getByRole('textbox', { name: 'Input' })).toHaveValue('示例内容');
    await userEvent.click(canvas.getByRole('button', { name: '重置两侧内容' }));
    await expect(canvas.getByRole('textbox', { name: 'BadInput' })).toHaveValue('示例内容');
  },
};

const checkClear: NonNullable<Story['play']> = async ({ canvas, userEvent, args }) => {
  if (!shouldRunInteractions) return;
  await userEvent.click(canvas.getByRole('button', { name: 'Clear input' }));
  const input = canvas.getByRole('textbox', { name: '输入内容' });
  await expect(input).toHaveValue('');
  await expect(input).toHaveFocus();
  await expect(canvas.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
  // 清空必须通知原有两种回调；不依赖它们的执行顺序。
  await expect(args.onChange).toHaveBeenCalledOnce();
  await expect(args.onValueChange).toHaveBeenCalledOnce();
  await expect(args.onValueChange).toHaveBeenLastCalledWith('', expect.anything());
  await userEvent.type(input, 'new');
  await expect(canvas.getByRole('button', { name: 'Clear input' })).toBeVisible();
};
export const Clearable: Story = { play: checkClear };
export const Controlled: Story = {
  render: (args) => <ValueExample key={String(args.defaultValue)} {...args} controlled />,
  play: async (context) => {
    if (!shouldRunInteractions) return;
    await checkClear(context);
    await context.userEvent.click(context.canvas.getByRole('button', { name: '外部重置' }));
    await expect(context.canvas.getByRole('textbox', { name: '输入内容' })).toHaveValue('外部重置值');
  },
};

function PasswordExample(args: BadInputProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor={`${id}-plain`}>Input 密码</FieldLabel>
        <Input id={`${id}-plain`} type="password" defaultValue="demo-password" />
        <FieldDescription>原始密码输入，没有显隐操作。</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-local`}>BadInput 内部管理显隐</FieldLabel>
        <BadInput {...args} id={`${id}-local`} type="password" showPassword={undefined} />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${id}-controlled`}>BadInput 受控显隐</FieldLabel>
        <BadInput
          {...args}
          id={`${id}-controlled`}
          type="password"
          showPassword={visible}
          onShowPasswordChange={(next) => {
            setVisible(next);
            args.onShowPasswordChange?.(next);
          }}
        />
        <FieldDescription>showPassword 与回调配合使用；allowClear 在密码模式下不显示清空按钮。</FieldDescription>
      </Field>
      <p className="text-sm">受控密码状态：{visible ? '可见' : '隐藏'}</p>
    </div>
  );
}
export const Password: Story = {
  args: { defaultValue: 'demo-password', type: 'password' },
  render: (args) => <PasswordExample {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const local = canvas.getByLabelText('BadInput 内部管理显隐');
    const controlled = canvas.getByLabelText('BadInput 受控显隐');
    await expect(local).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getAllByRole('button', { name: 'Show password' })[0]!);
    await expect(local).toHaveAttribute('type', 'text');
    const toggle = canvas.getByRole('button', { name: 'Hide password' });
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    await expect(local).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getAllByRole('button', { name: 'Show password' })[1]!);
    await expect(controlled).toHaveAttribute('type', 'text');
    await expect(args.onShowPasswordChange).toHaveBeenLastCalledWith(true);
    await expect(canvas.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
  },
};

function LoadingExample(args: BadInputProps) {
  const [loading, setLoading] = useState(args.loading ?? true);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        加载时仍可输入。结束加载后，有值的文本框恢复清空按钮，密码框恢复显隐按钮。
      </p>
      <Button variant="outline" className="self-start" onClick={() => setLoading((value) => !value)}>
        {loading ? '结束加载' : '开始加载'}
      </Button>
      <ValueExample {...args} loading={loading} />
    </div>
  );
}
export const Loading: Story = {
  args: { loading: true },
  render: (args) => <LoadingExample key={String(args.loading)} {...args} />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '输入内容' });
    await expect(input).toHaveAttribute('aria-busy', 'true');
    await expect(input).toBeEnabled();
    await expect(canvas.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
    await userEvent.type(input, '!');
    await expect(input).toHaveValue('示例内容!');
    await userEvent.click(canvas.getByRole('button', { name: '结束加载' }));
    await expect(canvas.getByRole('button', { name: 'Clear input' })).toBeVisible();
  },
};

export const DisabledAndReadOnly: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <section aria-label="禁用输入">
        <ValueExample {...args} disabled />
      </section>
      <section aria-label="只读输入">
        <ValueExample {...args} readOnly />
      </section>
    </div>
  ),
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    const disabled = within(canvas.getByRole('region', { name: '禁用输入' }));
    const readOnly = within(canvas.getByRole('region', { name: '只读输入' }));
    await expect(disabled.getByRole('textbox')).toBeDisabled();
    await expect(disabled.getByRole('button', { name: 'Clear input' })).toBeDisabled();
    await expect(readOnly.getByRole('textbox')).toHaveAttribute('readonly');
    await expect(readOnly.getByRole('button', { name: 'Clear input' })).toBeDisabled();
  },
};

function RefExample(args: BadInputProps) {
  const id = useId();
  const inputRef = useRef<BadInputHandle>(null);
  const [visible, setVisible] = useState<boolean | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor={id}>ref 示例密码</FieldLabel>
        <BadInput {...args} id={id} ref={inputRef} type="password" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => inputRef.current?.focus()}>
          聚焦输入
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
        >
          选中全部
        </Button>
        {/* ref 属性不是响应式状态，点击时读取当前值并展示。 */}
        <Button variant="outline" onClick={() => setVisible(inputRef.current?.isPasswordVisible ?? false)}>
          读取显隐状态
        </Button>
      </div>
      <p className="text-sm">最近读取的显隐状态：{visible === null ? '尚未读取' : visible ? '可见' : '隐藏'}</p>
      <p className="text-sm text-muted-foreground">
        ref 提供 focus、select 和 isPasswordVisible；不会直接暴露原生 input DOM。
      </p>
    </div>
  );
}
export const ImperativeHandle: Story = {
  args: { defaultValue: 'demo-password', type: 'password' },
  render: (args) => <RefExample {...args} />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByLabelText('ref 示例密码') as HTMLInputElement;
    await userEvent.click(canvas.getByRole('button', { name: '聚焦输入' }));
    await expect(input).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }));
    await userEvent.click(canvas.getByRole('button', { name: '读取显隐状态' }));
    await expect(canvas.getByText('最近读取的显隐状态：可见')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '选中全部' }));
    await expect(input).toHaveFocus();
    await expect(input.selectionStart).toBe(0);
    await expect(input.selectionEnd).toBe('demo-password'.length);
  },
};
