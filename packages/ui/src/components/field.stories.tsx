import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field';
import { Input } from './input';
import { Textarea } from './textarea';
import { Checkbox } from './checkbox';
import { Button } from './button';
function Example({
  orientation = 'vertical',
  disabled = false,
  invalid = false,
  readOnly = false,
}: {
  orientation?: 'vertical' | 'horizontal' | 'responsive';
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
}) {
  const id = useId();
  return (
    <FieldGroup>
      <Field orientation={orientation} data-disabled={disabled} data-invalid={invalid}>
        <FieldContent>
          <FieldLabel htmlFor={id}>项目名称</FieldLabel>
          <FieldDescription id={`${id}-hint`}>用一个便于辨认的名称标记项目。</FieldDescription>
        </FieldContent>
        <Input
          id={id}
          defaultValue={invalid ? '' : 'bad-ui'}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
        />
        {invalid && <FieldError id={`${id}-error`}>项目名称不能为空</FieldError>}
      </Field>
    </FieldGroup>
  );
}
function MultiFieldExample() {
  const id = useId();
  return (
    <FieldSet>
      <FieldLegend>项目设置</FieldLegend>
      <FieldDescription>这些信息只用于示例展示。</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>名称</FieldLabel>
          <Input id={`${id}-name`} defaultValue="bad-ui" />
        </Field>
        <FieldSeparator>更多信息</FieldSeparator>
        <Field>
          <FieldLabel htmlFor={`${id}-description`}>说明</FieldLabel>
          <Textarea id={`${id}-description`} placeholder="描述项目用途" />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
function CheckboxExample({ card = false }: { card?: boolean }) {
  const id = useId();
  return (
    <FieldSet>
      <FieldLegend variant="label">通知偏好</FieldLegend>
      <FieldGroup>
        {card ? (
          <FieldLabel htmlFor={id}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>订阅更新</FieldTitle>
                <FieldDescription id={`${id}-hint`}>接收版本发布通知。</FieldDescription>
              </FieldContent>
              <Checkbox id={id} aria-describedby={`${id}-hint`} />
            </Field>
          </FieldLabel>
        ) : (
          <Field orientation="horizontal">
            <Checkbox id={id} aria-describedby={`${id}-hint`} />
            <FieldContent>
              <FieldLabel htmlFor={id}>订阅更新</FieldLabel>
              <FieldDescription id={`${id}-hint`}>接收版本发布通知。</FieldDescription>
            </FieldContent>
          </Field>
        )}
      </FieldGroup>
    </FieldSet>
  );
}
function ValidationExample() {
  const id = useId();
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const invalid = submitted && !name.trim();
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <FieldGroup>
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor={id}>项目名称（必填）</FieldLabel>
          <Input
            id={id}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            required
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
          />
          {invalid && <FieldError id={`${id}-error`}>请输入项目名称</FieldError>}
        </Field>
        <Button type="submit">保存设置</Button>
        {submitted && !invalid && <p role="status">已保存：{name.trim()}</p>}
      </FieldGroup>
    </form>
  );
}
function ErrorsExample() {
  const id = useId();
  return (
    <FieldGroup>
      <Field data-invalid>
        <FieldLabel htmlFor={id}>密码</FieldLabel>
        <Input id={id} type="password" autoComplete="new-password" aria-invalid aria-describedby={`${id}-error`} />
        <FieldError
          id={`${id}-error`}
          errors={[{ message: '至少包含 8 个字符' }, { message: '至少包含一个数字' }, { message: '至少包含 8 个字符' }]}
        />
      </Field>
    </FieldGroup>
  );
}
const meta = {
  title: 'Components/Field',
  component: Example,
  args: { orientation: 'vertical', disabled: false, invalid: false, readOnly: false },
  argTypes: { orientation: { control: 'radio', options: ['vertical', 'horizontal', 'responsive'] } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '表单布局与语义组合，包含 Label、Description、Error、Content、Group、Set 和 Legend。Field 不执行校验；调用方同步 data-invalid 与控件 aria-invalid，并通过 id 关联标签和提示。responsive 依据 FieldGroup 容器宽度切换布局。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '项目名称' });
    await userEvent.clear(input);
    await userEvent.type(input, '组件文档');
    await expect(input).toHaveValue('组件文档');
  },
};
export const Horizontal: Story = { args: { orientation: 'horizontal' } };
export const Responsive: Story = { args: { orientation: 'responsive' } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Invalid: Story = { args: { invalid: true } };
export const GroupedFields: Story = { render: () => <MultiFieldExample /> };
export const CheckboxField: Story = { render: () => <CheckboxExample /> };
export const ChoiceCard: Story = { render: () => <CheckboxExample card /> };
export const Validation: Story = {
  render: () => <ValidationExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '保存设置' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('请输入项目名称');
    await userEvent.type(canvas.getByRole('textbox', { name: '项目名称（必填）' }), 'bad-ui');
    await userEvent.click(canvas.getByRole('button', { name: '保存设置' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已保存：bad-ui');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
export const MultipleErrors: Story = {
  render: () => <ErrorsExample />,
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};
