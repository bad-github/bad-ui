import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Input } from './input';

const meta = {
  // 在侧边栏 Components 分组中展示输入框。
  title: 'Components/Input',
  // 用实际组件生成文档与 Props 信息。
  component: Input,
  // 提供可访问名称、占位文案和回调记录；不传 value，保留自由输入能力。
  args: {
    'aria-label': '示例输入框',
    placeholder: '请输入内容',
    disabled: false,
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
    onKeyDown: fn(),
  },
  // 输入框默认占满容器，限制展示宽度并适应窄视口。
  decorators: [
    (Story) => (
      <div style={{ width: 'min(320px, 80vw)' }}>
        <Story />
      </div>
    ),
  ],
  // 定义 Controls 的编辑方式，而非更改组件本身的 props 类型。
  argTypes: {
    // 下拉菜单展示常用输入类型。
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search'] },
    // 禁用时不可编辑，也不能正常获得焦点。
    disabled: { control: 'boolean' },
    // 只读时禁止修改，仍可获得焦点与选择文本。
    readOnly: { control: 'boolean' },
    // 隐藏 value 控件，避免意外将示例变为没有状态更新逻辑的受控输入框。
    value: { control: false },
  },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
// defaultValue 初始化非受控输入框的值，readOnly 表达只读状态。
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: '只读内容' } };
export const Invalid: Story = {
  // 标记错误状态，并将输入框与下方提示文本关联。
  args: { 'aria-invalid': true, 'aria-describedby': 'input-error' },
  // 错误示例组合输入框与提示文案，展示实际使用方式。
  render: (args) => (
    <div className="space-y-2">
      <Input {...args} />
      <p id="input-error" className="text-sm text-destructive">
        请输入有效内容。
      </p>
    </div>
  ),
};
