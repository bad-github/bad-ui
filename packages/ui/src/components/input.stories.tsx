import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
// Meta 描述整个组件的公共配置；StoryObj 描述单个示例，二者只用于 TypeScript 类型检查。
import type { Meta, StoryObj } from '@storybook/react-vite';
// expect 用于断言实际结果；fn 创建可追踪调用记录的替身函数，不执行真实业务逻辑。
// 从 storybook/test 导入可让操作和断言接入 Storybook 的测试面板。
import { expect, fn } from 'storybook/test';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Input } from './input';

// 受控示例单独定义为 React 组件，遵守 Hooks 规则，避免在普通回调中调用 useState。
function ControlledInputExample(args: ComponentProps<typeof Input>) {
  // value 由调用方持有；每次 onChange 先更新状态，再通知 story 中的替身回调。
  const [value, setValue] = useState('初始内容');
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Input
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          args.onChange?.(event);
        }}
      />
      <p role="status" className="text-sm text-muted-foreground">当前值：{value || '（空）'}</p>
    </section>
  );
}

const meta = {
  // 在侧边栏 Components 分组中展示输入框。
  title: 'Components/Input',
  // 用实际组件生成文档与 Props 信息。
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          '单行输入框，透传原生 input 属性和事件。支持受控与非受控用法；标签、辅助说明、校验逻辑由调用方组合。详细说明见 Development / Input Guide。',
      },
    },
  },
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: '原生输入类型，影响键盘、角色和浏览器校验。不同类型的约束以浏览器行为为准。',
      table: { category: '基本属性', defaultValue: { summary: 'text（浏览器默认）' } },
    },
    id: { control: 'text', description: '与 label 的 htmlFor 关联；同一页面内保持唯一。', table: { category: '基本属性' } },
    name: { control: 'text', description: '表单提交时的字段名，不是可访问名称。', table: { category: '基本属性' } },
    placeholder: { control: 'text', description: '空值时的输入提示，不能代替标签。', table: { category: '基本属性' } },
    defaultValue: { control: 'text', description: '非受控输入的初始值；挂载后修改不会直接替换用户当前输入。', table: { category: '值管理' } },
    // 禁用时不可编辑，也不能正常获得焦点。
    disabled: { control: 'boolean', description: '禁止编辑和聚焦，原生表单提交时排除该字段。', table: { category: '状态' } },
    // 只读时禁止修改，仍可获得焦点与选择文本。
    readOnly: { control: 'boolean', description: '禁止编辑，仍可聚焦、选择和复制，保留表单值。', table: { category: '状态' } },
    required: { control: 'boolean', description: '参与原生必填校验；不会自行生成错误文案。', table: { category: '校验' } },
    maxLength: { control: 'number', description: '限制适用文本类型的输入长度，不能用于限制 number 的数值。', table: { category: '校验' } },
    min: { control: 'number', description: 'number 等适用类型的最小值，超出范围会被判定为无效。', table: { category: '校验' } },
    max: { control: 'number', description: 'number 等适用类型的最大值，不保证输入时阻止超限。', table: { category: '校验' } },
    step: { control: 'number', description: '适用数值类型的合法步长，例如整数为 1。', table: { category: '校验' } },
    autoComplete: { control: 'text', description: '浏览器自动填充提示，例如 email、username；实际填充取决于浏览器。', table: { category: '基本属性' } },
    'aria-label': { control: 'text', description: '没有可见标签时提供可访问名称。', table: { category: '无障碍' } },
    'aria-describedby': { control: 'text', description: '辅助说明或错误提示节点的 id；对应节点必须存在。', table: { category: '无障碍' } },
    'aria-invalid': { control: 'boolean', description: '表达业务校验失败并显示错误样式，不负责执行校验。', table: { category: '无障碍' } },
    // 隐藏 value 控件，避免意外将示例变为没有状态更新逻辑的受控输入框。
    value: { control: false, description: '受控值，必须配合 onChange 同步更新；见 Controlled 示例。', table: { category: '值管理' } },
    onChange: { control: false, description: '用户输入变化时触发；通过 event.currentTarget.value 读取值。', table: { category: '事件' } },
    onFocus: { control: false, description: '输入框获得焦点时触发。', table: { category: '事件' } },
    onBlur: { control: false, description: '输入框失去焦点时触发。', table: { category: '事件' } },
    onKeyDown: { control: false, description: '按键按下时触发，event.key 表示按键名称。', table: { category: '事件' } },
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
    if (!shouldRunInteractions) return;
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
    if (!shouldRunInteractions) return;
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
    if (!shouldRunInteractions) return;
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
    <div className="flex flex-col gap-2">
      <Input {...args} />
      <p id="input-error" className="text-sm text-destructive">
        请输入有效内容。
      </p>
    </div>
  ),
  play: async ({ canvas, userEvent, args, step }) => {
    if (!shouldRunInteractions) return;
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

// 本包尚未提供 Field / Label 组件；这里用原生 label 展示 Input 的关联契约。
export const WithLabel: Story = {
  args: { id: 'input-name', name: 'name', 'aria-label': undefined, placeholder: '请输入姓名' },
  parameters: { docs: { description: { story: '推荐提供可见标签；htmlFor 与输入框 id 一致，无需再提供 aria-label。' } } },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={args.id}>姓名</label>
      <Input {...args} />
    </div>
  ),
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    await step('点击可见标签将焦点交给对应输入框', async () => {
      // getByLabelText 会根据 label 关联找到输入框，不是找到 label 本身。
      const input = canvas.getByLabelText('姓名');
      await expect(input).toHaveAccessibleName('姓名');
      await userEvent.click(canvas.getByText('姓名', { selector: 'label' }));
      await expect(input).toHaveFocus();
    });
  },
};

export const WithDescription: Story = {
  args: {
    id: 'input-account', name: 'username', autoComplete: 'username',
    'aria-label': undefined, 'aria-describedby': 'input-account-help', placeholder: '请输入账号',
  },
  parameters: { docs: { description: { story: '标签说明用途，辅助文字说明限制；aria-describedby 关联辅助文字的 id。' } } },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={args.id}>账号</label>
      <Input {...args} />
      <p id="input-account-help" className="text-sm text-muted-foreground">用于登录，可填写常用账号。</p>
    </div>
  ),
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '账号' });
    await expect(input).toHaveAccessibleDescription('用于登录，可填写常用账号。');
    // toHaveAttribute 验证属性确实透传到了 DOM，而不是仅存在于 args 对象中。
    await expect(input).toHaveAttribute('name', 'username');
    await expect(input).toHaveAttribute('autocomplete', 'username');
  },
};

export const Controlled: Story = {
  parameters: { docs: { description: { story: '调用方用 useState 持有 value，并在 onChange 中同步更新。下方状态文字用于验证状态与输入一致。' } } },
  render: (args) => <ControlledInputExample {...args} />,
  play: async ({ canvas, userEvent, args, step }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '示例输入框' });
    await step('受控输入将新值同步到调用方状态', async () => {
      await expect(input).toHaveValue('初始内容');
      await userEvent.clear(input);
      await userEvent.type(input, '受控内容');
      await expect(input).toHaveValue('受控内容');
      await expect(canvas.getByRole('status')).toHaveTextContent('当前值：受控内容');
      await expect(args.onChange).toHaveBeenCalled();
    });
  },
};

export const WithDefaultValue: Story = {
  args: { defaultValue: '初始内容' },
  parameters: { docs: { description: { story: '非受控输入只设置 defaultValue，之后由 DOM 管理当前值；不要同时传 value。' } } },
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '示例输入框' });
    await expect(input).toHaveValue('初始内容');
    await userEvent.clear(input);
    await userEvent.type(input, '更新内容');
    await expect(input).toHaveValue('更新内容');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Required: Story = {
  args: { required: true, 'aria-label': '姓名（必填）' },
  parameters: { docs: { description: { story: 'required 使用浏览器原生校验：空值无效，填写后有效。Input 不会自动生成业务错误提示。' } } },
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '姓名（必填）' });
    await step('必填输入框从空值无效变为填写后有效', async () => {
      await expect(input).toBeRequired();
      await expect(input).toBeInvalid();
      await userEvent.type(input, '张三');
      // toBeValid 检查浏览器原生有效性和 aria-invalid 状态，不是验证业务规则。
      await expect(input).toBeValid();
    });
  },
};

export const MaxLength: Story = {
  args: { maxLength: 5, placeholder: '最多输入 5 个英文字母' },
  parameters: { docs: { description: { story: 'maxLength 限制文本输入；按 UTF-16 码元计数，不一定等于用户感知的字符数。此例使用英文字母避免歧义。' } } },
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '示例输入框' });
    await userEvent.type(input, 'abcdefg');
    await expect(input).toHaveValue('abcde');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Email: Story = {
  args: { type: 'email', name: 'email', autoComplete: 'email', 'aria-label': '邮箱', placeholder: 'name@example.com' },
  parameters: { docs: { description: { story: 'type="email" 使用浏览器原生邮箱格式校验；格式正确不代表地址真实存在。' } } },
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '邮箱' });
    await step('邮箱格式从无效变为有效', async () => {
      await userEvent.type(input, 'invalid-email');
      await expect(input).toBeInvalid();
      await userEvent.clear(input);
      await userEvent.type(input, 'name@example.com');
      await expect(input).toHaveValue('name@example.com');
      await expect(input).toBeValid();
    });
  },
};

export const Password: Story = {
  args: { type: 'password', autoComplete: 'new-password', 'aria-label': '密码', placeholder: '请输入密码' },
  parameters: { docs: { description: { story: '密码类型由浏览器遮蔽显示，但 JavaScript 仍可读取真实值；遮蔽不等于加密。测试只使用虚构密码。' } } },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    // password 没有隐含 textbox 角色，通过可访问名称查找。
    const input = canvas.getByLabelText('密码');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.type(input, 'demo-password');
    await expect(input).toHaveValue('demo-password');
  },
};

export const Number: Story = {
  args: { type: 'number', min: 1, max: 10, step: 1, 'aria-label': '数量', placeholder: '1 到 10' },
  parameters: { docs: { description: { story: '数值输入的角色为 spinbutton。min / max 定义有效范围，不保证阻止输入超限值；事件里的 value 仍是字符串。' } } },
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('spinbutton', { name: '数量' });
    await step('数值范围约束允许输入，但标记超限值无效', async () => {
      await userEvent.type(input, '11');
      // 数值输入的 toHaveValue 使用数字；输入事件中读取 value 时则仍得到字符串。
      await expect(input).toHaveValue(11);
      await expect(input).toBeInvalid();
      await userEvent.clear(input);
      await userEvent.type(input, '5');
      await expect(input).toHaveValue(5);
      await expect(input).toBeValid();
    });
  },
};
