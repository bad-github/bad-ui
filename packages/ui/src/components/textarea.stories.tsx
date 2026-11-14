import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Textarea } from './textarea';
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from './field';
function Example({
  disabled = false,
  invalid = false,
  readOnly = false,
  initial = '',
  limit = false,
}: {
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  initial?: string;
  limit?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(initial);
  return (
    <FieldGroup>
      <Field data-invalid={invalid} data-disabled={disabled}>
        <FieldLabel htmlFor={id}>项目说明</FieldLabel>
        <Textarea
          id={id}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={limit ? 100 : undefined}
          placeholder="请输入项目说明"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-hint ${id}-error` : `${id}-hint`}
        />
        <FieldDescription id={`${id}-hint`}>
          {limit ? `已输入 ${value.length} / 100 字符` : '支持多行文本，此示例仅保存在本地。'}
        </FieldDescription>
        {invalid && <FieldError id={`${id}-error`}>请补充有效的项目说明。</FieldError>}
      </Field>
    </FieldGroup>
  );
}
const meta = {
  title: 'Components/Textarea',
  component: Example,
  args: { disabled: false, invalid: false, readOnly: false, initial: '', limit: false },
  render: (args) => <Example key={args.initial} {...args} />,
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
          '原生多行输入，组合 Field 标签、说明与错误信息。支持受控值、禁用、只读和字符上限；浏览器支持时随内容增长。maxLength 按原生字符计数规则限制输入。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '项目说明' });
    await userEvent.type(input, '第一行{Enter}第二行');
    await expect(input).toHaveValue('第一行\n第二行');
  },
};
export const WithInitialValue: Story = { args: { initial: '这是一个组件文档项目。' } };
export const Disabled: Story = { args: { disabled: true, initial: '暂时无法编辑。' } };
export const ReadOnly: Story = { args: { readOnly: true, initial: '只读说明仍可选中和复制。' } };
export const Invalid: Story = { args: { invalid: true } };
export const CharacterLimit: Story = { args: { limit: true } };
