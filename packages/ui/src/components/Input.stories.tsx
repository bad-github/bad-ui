// Meta 描述整个组件的公共配置；StoryObj 描述单个示例，二者只用于 TypeScript 类型检查。
import type { Meta, StoryObj } from '@storybook/react-vite';
// expect 用于断言实际结果；fn 创建可追踪调用记录的替身函数，不执行真实业务逻辑。
// 从 storybook/test 导入可让操作和断言接入 Storybook 的测试面板。
import { expect, fn } from 'storybook/test';
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
    // 将这些函数作为组件 props 传入：既在 Actions 中记录事件，也可在 play 中断言调用。
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
// satisfies 检查配置是否符合 Input 的类型，同时保留具体属性的类型推断。
} satisfies Meta<typeof Input>;
export default meta;
// 后面的每个 story 都继承 meta 的公共配置，并可覆盖 args、添加 play 等。
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // play 在 story 渲染完成后自动运行，模拟用户操作并验证结果。
  // canvas：限定在当前 story 内查找元素；userEvent：模拟点击、输入和键盘操作。
  // args：当前传给组件的 props，包含上面的替身回调；step：给一组操作命名。
  // 操作和断言都加 await，确保按顺序执行，并在 Interactions 面板中记录过程。
  play: async ({ canvas, userEvent, args, step }) => {
    // getByRole 按无障碍角色查找元素；普通文本输入框的隐含角色为 textbox。
    // name 是可访问名称，这里来自 aria-label，不是 input 的 name 属性或 placeholder。
    // 找不到或找到多个匹配元素时会报错，使测试及时暴露问题。
    const input = canvas.getByRole('textbox', { name: '示例输入框' });

    // step 的文字会显示在 Interactions 面板中，便于定位失败的环节。
    await step('点击输入框后获得焦点，并触发 onFocus', async () => {
      // click 模拟用户点击；toHaveFocus 验证当前获得焦点的元素确实是该输入框。
      await userEvent.click(input);
      await expect(input).toHaveFocus();
      // toHaveBeenCalled 检查替身函数至少被调用过一次，不限定精确次数。
      await expect(args.onFocus).toHaveBeenCalled();
    });

    await step('输入和清空内容时更新值，并触发 onChange', async () => {
      // type 模拟逐字输入；toHaveValue 比较表单控件当前的值，而非页面文本。
      await userEvent.type(input, 'Hello Storybook');
      await expect(input).toHaveValue('Hello Storybook');
      await expect(args.onChange).toHaveBeenCalled();
      await userEvent.clear(input); // clear 模拟选中并删除输入框里的全部内容。
      await expect(input).toHaveValue('');
    });

    await step('按 Enter 时向外传递键盘事件', async () => {
      // keyboard 向当前焦点元素发送按键；{Enter} 是特殊按键语法，不是输入文字。
      await userEvent.keyboard('{Enter}');
      // toHaveBeenCalledWith 检查是否有一次调用匹配参数。
      // objectContaining 只匹配事件对象中的 key，允许事件还包含其他属性。
      await expect(args.onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
    });

    await step('按 Tab 离开输入框，并触发 onBlur', async () => {
      // tab 模拟键盘焦点导航；not 对后面的断言取反，这里要求焦点已经离开。
      await userEvent.tab();
      await expect(input).not.toHaveFocus();
      await expect(args.onBlur).toHaveBeenCalled();
    });
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent, args, step }) => {
    const input = canvas.getByRole('textbox', { name: '示例输入框' });

    await step('禁用输入框不可输入，也不触发输入和焦点回调', async () => {
      // toBeDisabled 检查原生禁用语义，并非仅凭颜色或 CSS 判断。
      await expect(input).toBeDisabled();
      // type 默认会先点击目标；禁用样式含 pointer-events: none，点击会被测试工具拒绝。
      // skipClick 只跳过这次点击，不取消组件的 disabled 状态。
      await userEvent.type(input, '不可输入', { skipClick: true });
      await expect(input).toHaveValue('');
      await expect(input).not.toHaveFocus();
      // not.toHaveBeenCalled 要求回调一次也没有触发。
      await expect(args.onChange).not.toHaveBeenCalled();
      await expect(args.onFocus).not.toHaveBeenCalled();
    });
  },
};
// defaultValue 初始化非受控输入框的值，readOnly 表达只读状态。
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: '只读内容' },
  play: async ({ canvas, userEvent, args, step }) => {
    const input = canvas.getByRole('textbox', { name: '示例输入框' });

    await step('只读输入框可聚焦，但输入和删除均不改变原值', async () => {
      await userEvent.click(input);
      await expect(input).toHaveFocus();
      await expect(args.onFocus).toHaveBeenCalled();
      await userEvent.type(input, '新增内容');
      // Backspace 模拟删除键；只读状态下新增和删除操作都不应改变原值。
      await userEvent.keyboard('{Backspace}');
      await expect(input).toHaveValue('只读内容');
      await expect(args.onChange).not.toHaveBeenCalled();
    });
  },
};
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
  play: async ({ canvas, userEvent, args, step }) => {
    const input = canvas.getByRole('textbox', { name: '示例输入框' });

    await step('错误状态关联可见提示，仍允许用户修改内容', async () => {
      // toBeInvalid 检查 aria-invalid 或原生表单有效性，不检查红色边框。
      await expect(input).toBeInvalid();
      // getByText 按文字查找提示节点；toBeVisible 检查节点是否可见。
      await expect(canvas.getByText('请输入有效内容。')).toBeVisible();
      // 检查辅助技术读到的描述：aria-describedby 应指向含这段文字的提示节点。
      await expect(input).toHaveAccessibleDescription('请输入有效内容。');
      await userEvent.type(input, '修改内容');
      await expect(input).toHaveValue('修改内容');
      await expect(args.onChange).toHaveBeenCalled();
      // 错误状态由调用方传入，输入文字不会自动清除 aria-invalid。
      await expect(input).toBeInvalid();
    });
  },
};
