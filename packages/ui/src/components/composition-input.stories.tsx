import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState, type ChangeEvent, type CompositionEvent } from 'react';
import { expect, fireEvent, fn } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { CompositionInput, type CompositionInputProps } from './composition-input';
import { Button } from './button';
import { Input } from './input';
import { Field, FieldLabel, FieldDescription } from './field';
import { Separator } from './separator';

const meta = {
  title: 'Custom Components/CompositionInput',
  component: CompositionInput,
  args: {
    'aria-label': '输入内容',
    placeholder: '支持中文等输入法',
    disabled: false,
    readOnly: false,
    onChange: fn(),
    onFinalChange: fn(),
    onCompositionStart: fn(),
    onCompositionEnd: fn(),
  },
  argTypes: {
    value: { control: false, description: '受控值，必须通过 onChange 实时更新，包括输入法草稿。' },
    defaultValue: { control: 'text', description: '非受控初始值，后续编辑由 Input 管理。' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    onChange: { control: false, description: '所有输入变化，包括组合期间的中间输入。' },
    onFinalChange: { control: false, description: '普通编辑立即通知，输入法组合结束后通知完整值；不内置防抖。' },
    onCompositionStart: { control: false, description: '输入法开始一轮文字组合时触发。' },
    onCompositionEnd: { control: false, description: '输入法完成或取消本轮组合时触发。' },
  },
  decorators: [
    (Story, { parameters }) => (
      <div className={parameters.comparisonLayout ? 'w-full max-w-4xl min-w-0 p-6' : 'w-full max-w-md min-w-0 p-6'}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '适配输入法组合的输入框。受控模式用 onChange 更新输入值，用 onFinalChange 执行搜索或筛选；非受控模式使用 defaultValue。可在 Actions 中观察事件顺序。自动测试通过合成组合事件验证逻辑，真实输入法体验请在预览中手动输入拼音检查。',
      },
    },
  },
} satisfies Meta<typeof CompositionInput>;
export default meta;
type Story = StoryObj<typeof meta>;

const comparisonProjects = ['你好世界', '你的小组件', '组件库', '文档站'];

function ComparisonPanel({ composed }: { composed: boolean }) {
  const id = useId();
  const name = composed ? 'CompositionInput' : 'Input';
  const [state, setState] = useState({ value: '', keyword: '', count: 0, composing: false, events: [] as string[] });
  const append = (events: string[], event: string) => [...events, event].slice(-6);
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    // 两侧都实时更新受控输入值；只有普通 Input 在每次 onChange 时执行筛选。
    setState((previous) => ({
      ...previous,
      value,
      keyword: composed ? previous.keyword : value,
      count: previous.count + (composed ? 0 : 1),
      events: append(previous.events, `onChange → ${JSON.stringify(value)}`),
    }));
  };
  const onFinalChange = (value: string) => {
    setState((previous) => ({
      ...previous,
      keyword: value,
      count: previous.count + 1,
      events: append(previous.events, `onFinalChange → ${JSON.stringify(value)}`),
    }));
  };
  const onCompositionStart = () => {
    setState((previous) => ({
      ...previous,
      composing: true,
      events: append(previous.events, 'compositionstart：开始组合'),
    }));
  };
  const onCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setState((previous) => ({
      ...previous,
      composing: false,
      events: append(previous.events, `compositionend → ${JSON.stringify(value)}`),
    }));
  };
  const inputProps = {
    id,
    value: state.value,
    onChange,
    onCompositionStart,
    onCompositionEnd,
    'aria-describedby': `${id}-hint`,
    placeholder: '用中文输入法输入 ni，再选定“你”',
  };
  const results = comparisonProjects.filter((project) => project.includes(state.keyword));
  return (
    <section className="flex min-w-0 flex-col gap-5" aria-label={`${name} 对比演示`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">
          {composed ? '用 onFinalChange 执行筛选' : '用 onChange 执行筛选'}
        </p>
      </div>
      <Field>
        <FieldLabel htmlFor={id}>{name} 搜索项目</FieldLabel>
        {composed ? <CompositionInput {...inputProps} onFinalChange={onFinalChange} /> : <Input {...inputProps} />}
        <FieldDescription id={`${id}-hint`}>
          {composed
            ? '输入框实时显示拼音，选字结束后才更新筛选结果。'
            : '每次输入变化都更新筛选结果，拼音草稿也参与筛选。'}
        </FieldDescription>
      </Field>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">当前输入</dt>
        <dd className="break-words">{state.value || '（空）'}</dd>
        <dt className="text-muted-foreground">输入法状态</dt>
        <dd>{state.composing ? '正在组合' : '未在组合'}</dd>
        <dt className="text-muted-foreground">业务筛选词</dt>
        <dd className="break-words">{state.keyword || '（空）'}</dd>
        <dt className="text-muted-foreground">执行筛选</dt>
        <dd>{state.count} 次</dd>
      </dl>
      <Separator />
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">筛选结果 · {results.length} 个项目</h4>
        {results.length ? (
          <ul className="flex flex-col gap-1 text-sm">
            {results.map((project) => (
              <li key={project}>{project}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">没有匹配的项目</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">最近 6 条事件</h4>
        {state.events.length ? (
          <ol className="flex flex-col gap-1 text-xs text-muted-foreground">
            {state.events.map((event, index) => (
              <li key={index} className="break-words">
                {event}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground">输入后显示事件及其收到的完整值。</p>
        )}
      </div>
    </section>
  );
}

function ComparisonExample() {
  const [version, setVersion] = useState(0);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">输入同样的内容，观察筛选何时执行</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          分别在两侧输入框中用中文输入法输入
          ni，先不要选字，观察业务筛选词和结果；再选定“你”，查看通知次数与事件记录。直接输入英文或粘贴时，两者通常表现一致。
        </p>
        <p className="text-sm text-muted-foreground">
          两侧数据独立。Input 本身不执行筛选，这里演示调用方把业务接在不同回调上的区别。
        </p>
        <Button variant="outline" className="self-start" onClick={() => setVersion((value) => value + 1)}>
          重置两侧演示
        </Button>
      </div>
      {/* 不联动输入值，避免程序赋值绕过原生事件，确保两侧都可以使用真实输入法操作。 */}
      <div key={version} className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ComparisonPanel composed={false} />
        <ComparisonPanel composed />
      </div>
    </div>
  );
}

export const Default: Story = {
  name: 'Input vs CompositionInput',
  parameters: { comparisonLayout: true },
  render: () => <ComparisonExample />,
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const plain = canvas.getByRole('textbox', { name: 'Input 搜索项目' });
    const composed = canvas.getByRole('textbox', { name: 'CompositionInput 搜索项目' });
    const plainPanel = canvas.getByRole('region', { name: 'Input 对比演示' });
    const composedPanel = canvas.getByRole('region', { name: 'CompositionInput 对比演示' });
    await step('同样的拼音草稿，普通输入立即筛选，组合输入保持原结果', async () => {
      fireEvent.compositionStart(plain);
      fireEvent.input(plain, { target: { value: 'ni' }, isComposing: true });
      fireEvent.compositionStart(composed);
      fireEvent.input(composed, { target: { value: 'ni' }, isComposing: true });
      await expect(plainPanel).toHaveTextContent('筛选结果 · 0 个项目');
      await expect(composedPanel).toHaveTextContent('筛选结果 · 4 个项目');
      await expect(composed).toHaveValue('ni');
    });
    await step('选字完成后两侧都筛选汉字', async () => {
      for (const input of [plain, composed]) {
        fireEvent.compositionEnd(input, { target: { value: '你' }, data: '你' });
        fireEvent.input(input, { target: { value: '你' }, isComposing: false });
      }
      await expect(plainPanel).toHaveTextContent('筛选结果 · 2 个项目');
      await expect(composedPanel).toHaveTextContent('筛选结果 · 2 个项目');
      await expect(composedPanel).toHaveTextContent('onFinalChange');
    });
    await userEvent.click(canvas.getByRole('button', { name: '重置两侧演示' }));
    await expect(canvas.getByRole('textbox', { name: 'Input 搜索项目' })).toHaveValue('');
    await expect(canvas.getByRole('textbox', { name: 'CompositionInput 搜索项目' })).toHaveValue('');
  },
};

export const BasicInput: Story = {
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '输入内容' });
    await userEvent.type(input, 'abc');
    await expect(input).toHaveValue('abc');
    await expect(args.onFinalChange).toHaveBeenLastCalledWith('abc');
    await expect(args.onFinalChange).toHaveBeenCalledTimes(3);
    await userEvent.clear(input);
    await expect(args.onFinalChange).toHaveBeenLastCalledWith('');
  },
};
export const DefaultValue: Story = { args: { defaultValue: '初始内容' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: '不可编辑' } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: '只读内容' } };

function ControlledExample(args: CompositionInputProps) {
  // 输入值与业务值分别存储：草稿实时显示，业务值只在输入完成后更新。
  const [value, setValue] = useState('');
  const [committedValue, setCommittedValue] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <CompositionInput
        {...args}
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          args.onChange?.(event);
        }}
        onFinalChange={(next) => {
          setCommittedValue(next);
          args.onFinalChange?.(next);
        }}
      />
      <p className="text-sm text-muted-foreground">业务收到的值：{committedValue || '（空）'}</p>
      <Button variant="outline" onClick={() => setValue('')}>
        清空输入
      </Button>
    </div>
  );
}
export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '输入内容' });
    await userEvent.type(input, 'hello');
    await expect(input).toHaveValue('hello');
    await userEvent.click(canvas.getByRole('button', { name: '清空输入' }));
    await expect(input).toHaveValue('');
    // 外部设置 value 不属于用户编辑，不应额外触发业务通知。
    await expect(args.onFinalChange).toHaveBeenCalledTimes(5);
    await expect(args.onFinalChange).toHaveBeenLastCalledWith('hello');
  },
  parameters: {
    docs: {
      description: {
        story: '清空按钮只修改受控输入值，不触发 onFinalChange，也不会清空已提交的业务值。业务重置可由调用方自行联动。',
      },
    },
  },
};

export const ImeComposition: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '模拟输入拼音 ni 后选定“你”，检查组合期间不通知、结束时通知一次、随后同值 input 不重复通知。此示例不启动操作系统的真实输入法。',
      },
    },
  },
  play: async ({ canvas, args, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '输入内容' });
    await step('开始组合，拼音草稿只触发 onChange', async () => {
      fireEvent.compositionStart(input);
      fireEvent.input(input, { target: { value: 'ni' }, isComposing: true });
      await expect(input).toHaveValue('ni');
      await expect(args.onCompositionStart).toHaveBeenCalledOnce();
      await expect(args.onChange).toHaveBeenCalledOnce();
      await expect(args.onFinalChange).not.toHaveBeenCalled();
    });
    await step('组合结束通知最终值，补发的同值输入只透传 onChange', async () => {
      // 将最终值放在 compositionend 事件上，随后补发 input，覆盖常见浏览器事件顺序。
      fireEvent.compositionEnd(input, { data: '你', target: { value: '你' } });
      await expect(args.onCompositionEnd).toHaveBeenCalledOnce();
      await expect(args.onFinalChange).toHaveBeenCalledOnce();
      await expect(args.onFinalChange).toHaveBeenLastCalledWith('你');
      fireEvent.input(input, { target: { value: '你' }, isComposing: false });
      await expect(args.onChange).toHaveBeenCalledTimes(2);
      await expect(args.onFinalChange).toHaveBeenCalledOnce();
    });
    await step('后续普通编辑继续正常通知', async () => {
      await userEvent.type(input, '!');
      await expect(args.onFinalChange).toHaveBeenCalledTimes(2);
      await expect(args.onFinalChange).toHaveBeenLastCalledWith('你!');
    });
  },
};

const projects = ['组件库', '文档站', '管理后台'];
function FilterExample(args: CompositionInputProps) {
  const [keyword, setKeyword] = useState('');
  const results = projects.filter((project) => project.includes(keyword));
  return (
    <div className="flex flex-col gap-4">
      {/* 使用非受控输入，只有 onFinalChange 更新筛选条件，拼音草稿不会提前筛选。 */}
      <CompositionInput
        {...args}
        onFinalChange={(next) => {
          setKeyword(next);
          args.onFinalChange?.(next);
        }}
      />
      <p role="status" className="text-sm text-muted-foreground">
        找到 {results.length} 个项目
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        {results.map((project) => (
          <li key={project}>{project}</li>
        ))}
      </ul>
    </div>
  );
}
export const WithFilter: Story = {
  render: (args) => <FilterExample {...args} />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '输入内容' });
    await userEvent.type(input, '组件');
    await expect(canvas.getByRole('status')).toHaveTextContent('找到 1 个项目');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1);
    await expect(canvas.getByRole('listitem')).toHaveTextContent('组件库');
    await userEvent.clear(input);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};
