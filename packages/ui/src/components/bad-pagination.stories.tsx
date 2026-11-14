import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { expect, fireEvent, fn, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { BadPagination, type BadPaginationProps } from './bad-pagination';
import { Button } from './button';
import { Field, FieldLabel } from './field';
import { NativeSelect, NativeSelectOption } from './native-select';

function Example(args: BadPaginationProps) {
  const [lastChange, setLastChange] = useState('尚未操作');
  return (
    <div className="flex flex-col gap-5">
      <BadPagination
        {...args}
        onChange={(page, pageSize) => {
          setLastChange(`第 ${page} 页，每页 ${pageSize} 条`);
          args.onChange?.(page, pageSize);
        }}
      />
      <p role="status" aria-label="分页事件" className="text-center text-sm text-muted-foreground">
        onChange：{lastChange}
      </p>
    </div>
  );
}

const meta = {
  title: 'Custom Components/BadPagination',
  component: BadPagination,
  args: {
    total: 238,
    defaultCurrent: 9,
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showTotal: true,
    showSizeChanger: true,
    showQuickJumper: true,
    disabled: false,
    onChange: fn(),
  },
  argTypes: {
    total: { control: { type: 'number', min: 0 }, description: '数据总条数，组件据此计算总页数。' },
    current: { control: false, description: '受控页码，需要通过 onChange 更新。' },
    pageSize: { control: false, description: '受控每页条数，需要通过 onChange 更新。' },
    defaultCurrent: { control: { type: 'number', min: 1 }, description: '非受控初始页码。' },
    defaultPageSize: { control: { type: 'number', min: 1 }, description: '非受控初始条数。' },
    pageSizeOptions: { control: 'object', description: '自定义正整数选项，去重并补入当前条数。' },
    showTotal: { control: 'boolean', description: '显示总条数，也支持函数渲染总数及当前记录范围。' },
    showSizeChanger: { control: 'boolean' },
    showQuickJumper: { control: 'boolean' },
    quickJumperTrigger: {
      control: 'select',
      options: ['blur', 'button'],
      description: '默认失焦跳转；button 模式显示跳转按钮。两者均支持 Enter。',
    },
    disabled: { control: 'boolean' },
    previousContent: { control: false, description: '上一页按钮内容，可替换为图标或文字。' },
    nextContent: { control: false, description: '下一页按钮内容，可替换为图标或文字。' },
    onChange: { control: false, description: '(page, pageSize)；切换条数时回到第 1 页，只通知一次。' },
  },
  // Controls 更改初始值时重建非受控示例；正常切页不会改变 key。
  render: (args) => <Example key={`${args.defaultCurrent}-${args.defaultPageSize}`} {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '在现有分页样式上增加总条数、条数选择和跳页。三个附加区域可分别开关，组件默认均隐藏；此默认示例全部开启方便操作。仅管理交互，不发请求、不切分数据。当前页从 1 开始；零数据保留禁用的第 1 页。可在页面下方直接观察 onChange 收到的页码和条数。',
      },
    },
  },
} satisfies Meta<typeof BadPagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByText('共 238 条')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '第 9 页' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: '下一页' }));
    await expect(canvas.getByRole('button', { name: '第 10 页' })).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(args.onChange).toHaveBeenLastCalledWith(10, 10);
    // 点击当前页属于无变化操作，不应重复请求数据。
    await userEvent.click(canvas.getByRole('button', { name: '第 10 页' }));
    await expect(args.onChange).toHaveBeenCalledOnce();
  },
};
export const Basic: Story = {
  args: { showTotal: false, showSizeChanger: false, showQuickJumper: false },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.queryByRole('combobox')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(canvas.queryByText('共 238 条')).not.toBeInTheDocument();
  },
};
export const PageSizeOptions: Story = {
  args: { defaultPageSize: 15, pageSizeOptions: [5, 10, 25, 25] },
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const select = canvas.getByRole('combobox', { name: '每页条数' });
    await expect(select).toHaveValue('15');
    await expect(within(select).getAllByRole('option')).toHaveLength(4);
    await userEvent.selectOptions(select, '25');
    await expect(canvas.getByRole('button', { name: '第 1 页' })).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(args.onChange).toHaveBeenLastCalledWith(1, 25);
  },
  parameters: {
    docs: {
      description: { story: '初始每页 15 条不在给定选项中，会自动补入；重复的 25 去重。切换条数后回到第 1 页。' },
    },
  },
};
export const QuickJumper: Story = {
  args: { quickJumperTrigger: 'button' },
  play: async ({ canvas, userEvent, args, step }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '跳至页码' });
    await step('Enter 跳转，越界时落到末页', async () => {
      await userEvent.type(input, '12{Enter}');
      await expect(args.onChange).toHaveBeenLastCalledWith(12, 10);
      await expect(input).toHaveValue('');
      await userEvent.type(input, '999');
      await userEvent.click(canvas.getByRole('button', { name: '跳转' }));
      await expect(args.onChange).toHaveBeenLastCalledWith(24, 10);
      await expect(canvas.getByRole('button', { name: '下一页' })).toBeDisabled();
    });
    await step('非法输入不提交，输入法选字 Enter 不跳页', async () => {
      await userEvent.type(input, '2.5{Enter}');
      await expect(canvas.getByRole('alert')).toHaveTextContent('请输入大于 0 的整数页码');
      await expect(args.onChange).toHaveBeenCalledTimes(2);
      await userEvent.clear(input);
      fireEvent.compositionStart(input);
      await userEvent.type(input, '3{Enter}');
      await expect(args.onChange).toHaveBeenCalledTimes(2);
      fireEvent.compositionEnd(input);
      await userEvent.keyboard('{Enter}');
      await expect(args.onChange).toHaveBeenCalledTimes(3);
      await expect(args.onChange).toHaveBeenLastCalledWith(3, 10);
    });
  },
};

function ControlledExample(args: BadPaginationProps) {
  const [pagination, setPagination] = useState({ current: 9, pageSize: 10 });
  return (
    <div className="flex flex-col gap-4">
      <BadPagination
        {...args}
        {...pagination}
        onChange={(current, pageSize) => {
          // 两个受控值一起更新；业务可在这里使用同一组参数加载数据。
          setPagination({ current, pageSize });
          args.onChange?.(current, pageSize);
        }}
      />
      <p role="status" className="text-center text-sm">
        受控状态：第 {pagination.current} 页，每页 {pagination.pageSize} 条
      </p>
      <Button variant="outline" className="self-center" onClick={() => setPagination({ current: 1, pageSize: 10 })}>
        外部重置
      </Button>
    </div>
  );
}
export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    await userEvent.selectOptions(canvas.getByRole('combobox'), '20');
    await expect(canvas.getByRole('status')).toHaveTextContent('第 1 页，每页 20 条');
    await userEvent.click(canvas.getByRole('button', { name: '下一页' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(2, 20);
    await userEvent.click(canvas.getByRole('button', { name: '外部重置' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('第 1 页，每页 10 条');
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};
export const ControlledWithoutUpdate: Story = {
  args: { current: 3, pageSize: 10 },
  parameters: {
    docs: {
      description: {
        story: '故意不更新受控 props：点击只通知 onChange，展示页码保持第 3 页。用于对比受控与非受控行为。',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '下一页' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(4, 10);
    await expect(canvas.getByRole('button', { name: '第 3 页' })).toHaveAttribute('aria-current', 'page');
  },
};
export const CustomTotal: Story = {
  args: { showTotal: (total, [start, end]) => `第 ${start}–${end} 条，共 ${total} 条` },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByText('第 81–90 条，共 238 条')).toBeVisible();
  },
};
export const Empty: Story = {
  args: { total: 0, showTotal: (total, [start, end]) => `第 ${start}–${end} 条，共 ${total} 条` },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByText('第 0–0 条，共 0 条')).toBeVisible();
    await expect(canvas.getByRole('button', { name: '第 1 页' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: '上一页' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: '下一页' })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: '跳至页码' })).toBeDisabled();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, args }) => {
    if (!shouldRunInteractions) return;
    const pagination = within(canvas.getByRole('navigation', { name: '分页' }));
    for (const button of pagination.getAllByRole('button')) {
      await expect(button).toBeDisabled();
      button.click();
    }
    await expect(pagination.getByRole('combobox')).toBeDisabled();
    await expect(pagination.getByRole('textbox')).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const LargeTotal: Story = {
  args: { total: 10000000, defaultCurrent: 500000 },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    const pagination = within(canvas.getByRole('navigation', { name: '分页' }));
    // 检查真实 DOM 数量，保证大数据只渲染少量页码，而非先创建全部页码再隐藏。
    await expect(pagination.getAllByRole('button').length).toBeLessThanOrEqual(10);
    await expect(pagination.getByRole('button', { name: '第 500000 页' })).toHaveAttribute('aria-current', 'page');
  },
};
function DynamicTotalExample(args: BadPaginationProps) {
  const [total, setTotal] = useState(238);
  return (
    <div className="flex flex-col gap-4">
      <BadPagination {...args} total={total} />
      <Button variant="outline" className="self-center" onClick={() => setTotal(15)}>
        减少到 15 条
      </Button>
      <p className="text-center text-sm text-muted-foreground">外部总数变化只约束合法展示页，不自动触发分页请求。</p>
    </div>
  );
}
export const DynamicTotal: Story = {
  render: (args) => <DynamicTotalExample {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '减少到 15 条' }));
    await expect(canvas.getByRole('button', { name: '第 2 页' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByRole('button', { name: '下一页' })).toBeDisabled();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const CustomNavigation: Story = {
  args: {
    defaultCurrent: 2,
    total: 30,
    // 图标只作装饰，按钮继续提供“上一页 / 下一页”的可访问名称。
    previousContent: <ChevronsLeftIcon aria-hidden="true" />,
    nextContent: <ChevronsRightIcon aria-hidden="true" />,
  },
  parameters: {
    docs: {
      description: {
        story:
          '只替换前后按钮的内容为双箭头，行为仍是翻一页。支持传入文字或自定义 React 节点，不要嵌套 button、a 等交互元素。',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '上一页' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(1, 10);
    await expect(canvas.getByRole('button', { name: '上一页' })).toBeDisabled();
    const next = canvas.getByRole('button', { name: '下一页' });
    next.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(2, 10);
    await userEvent.click(next);
    await expect(args.onChange).toHaveBeenLastCalledWith(3, 10);
    await expect(next).toBeDisabled();
  },
};

export const TextNavigation: Story = {
  args: { previousContent: '上一页', nextContent: '下一页' },
  parameters: {
    docs: { description: { story: '直接传入文字，替换默认的箭头与文字组合；仍保留上一页、下一页的按钮语义。' } },
  },
};

function NavigationPlaygroundExample(args: BadPaginationProps) {
  const id = useId();
  const [mode, setMode] = useState('default');
  const previousContent =
    mode === 'arrows' ? <ChevronsLeftIcon aria-hidden="true" /> : mode === 'text' ? '上一页' : undefined;
  const nextContent =
    mode === 'arrows' ? <ChevronsRightIcon aria-hidden="true" /> : mode === 'text' ? '下一页' : undefined;
  return (
    <div className="flex flex-col gap-6">
      <Field className="max-w-48">
        <FieldLabel htmlFor={id}>导航内容</FieldLabel>
        <NativeSelect id={id} value={mode} onChange={(event) => setMode(event.currentTarget.value)}>
          <NativeSelectOption value="default">默认图文</NativeSelectOption>
          <NativeSelectOption value="arrows">双箭头</NativeSelectOption>
          <NativeSelectOption value="text">纯文字</NativeSelectOption>
        </NativeSelect>
      </Field>
      <p className="text-sm text-muted-foreground">
        切换按钮内容后继续翻页，观察当前页和下方回调记录。双箭头仍然每次翻一页，不表示跳至首页或末页。
      </p>
      {/* 只更改内容 props，不重建分页实例；切换外观不会重置当前页或触发 onChange。 */}
      <Example {...args} previousContent={previousContent} nextContent={nextContent} />
    </div>
  );
}

export const NavigationPlayground: Story = {
  args: { defaultCurrent: 2, total: 30 },
  render: (args) => <NavigationPlaygroundExample {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const select = canvas.getByRole('combobox', { name: '导航内容' });
    await userEvent.selectOptions(select, 'arrows');
    const next = canvas.getByRole('button', { name: '下一页' });
    await expect(next.querySelector('svg')).toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(next);
    await expect(args.onChange).toHaveBeenLastCalledWith(3, 10);
    await userEvent.selectOptions(select, 'text');
    // 当前页和边界禁用状态应在切换外观后保留。
    await expect(canvas.getByRole('button', { name: '第 3 页' })).toHaveAttribute('aria-current', 'page');
    await expect(next).toBeDisabled();
    await expect(next.querySelector('svg')).not.toBeInTheDocument();
    const previous = canvas.getByRole('button', { name: '上一页' });
    previous.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith(2, 10);
    await userEvent.selectOptions(select, 'default');
    await expect(canvas.getByRole('button', { name: '第 2 页' })).toHaveAttribute('aria-current', 'page');
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const BlurQuickJumper: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '默认模式：输入页码后按 Tab 或点击输入框外自动跳转，没有跳转按钮。按 Enter 也可提交，随后失焦不会重复通知。',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '跳至页码' });
    await expect(canvas.queryByRole('button', { name: '跳转' })).not.toBeInTheDocument();
    await userEvent.type(input, '12');
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(args.onChange).toHaveBeenLastCalledWith(12, 10);
    await userEvent.type(input, '15{Enter}');
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenLastCalledWith(15, 10);
    // 失焦同样需要校验；非法草稿保持原样，便于用户修正。
    await userEvent.type(input, '2.5');
    await userEvent.tab();
    await expect(canvas.getByRole('alert')).toHaveTextContent('请输入大于 0 的整数页码');
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};

export const ButtonQuickJumper: Story = {
  args: { quickJumperTrigger: 'button' },
  parameters: { docs: { description: { story: '显式按钮模式：失焦不提交，点击跳转或按 Enter 时才提交。' } } },
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '跳至页码' });
    await userEvent.type(input, '12');
    await userEvent.tab();
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: '跳转' }));
    await expect(args.onChange).toHaveBeenCalledOnce();
    await expect(args.onChange).toHaveBeenLastCalledWith(12, 10);
  },
};
