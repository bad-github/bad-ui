import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { HighlightKeyword, type HighlightKeywordProps } from './highlight-keyword';
import { Input } from './input';
import { Textarea } from './textarea';
import { Switch } from './switch';
import { Field, FieldGroup, FieldLabel, FieldDescription } from './field';

function Playground({ compare = false, ...args }: HighlightKeywordProps & { compare?: boolean }) {
  const id = useId();
  const [text, setText] = useState(args.text);
  const [keyword, setKeyword] = useState(args.keyword);
  const [caseSensitive, setCaseSensitive] = useState(args.caseSensitive ?? true);
  const preview = (sensitive: boolean, label: string) => (
    <section className="flex min-w-0 flex-col gap-3" aria-label={label}>
      <h3 className="text-sm font-medium">{label}</h3>
      <p
        className="min-h-12 text-sm break-words whitespace-pre-wrap"
        data-testid={sensitive ? 'sensitive-result' : 'insensitive-result'}
      >
        <HighlightKeyword text={text} keyword={keyword} caseSensitive={sensitive} className={args.className} />
      </p>
      {!text && <p className="text-sm text-muted-foreground">原文为空，预览中没有内容。</p>}
    </section>
  );
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {compare
          ? '修改同一份原文和关键词，同时观察两种大小写规则的结果。'
          : '修改原文和关键词，预览会实时更新；可以清空关键词或输入 .、[、* 等字符。'}
      </p>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-text`}>原文</FieldLabel>
          <Textarea id={`${id}-text`} value={text} onChange={(event) => setText(event.currentTarget.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-keyword`}>关键词</FieldLabel>
          <Input
            id={`${id}-keyword`}
            value={keyword}
            onChange={(event) => setKeyword(event.currentTarget.value)}
            aria-describedby={`${id}-hint`}
          />
          <FieldDescription id={`${id}-hint`}>按普通文本匹配，首尾空白会被去除；空关键词不会高亮。</FieldDescription>
        </Field>
        {!compare && (
          <Field orientation="horizontal">
            <Switch id={`${id}-case`} checked={caseSensitive} onCheckedChange={setCaseSensitive} />
            <FieldLabel htmlFor={`${id}-case`}>区分大小写</FieldLabel>
          </Field>
        )}
      </FieldGroup>
      {compare ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {preview(true, '区分大小写结果')}
          {preview(false, '忽略大小写结果')}
        </div>
      ) : (
        preview(caseSensitive, '高亮结果')
      )}
    </div>
  );
}

const meta = {
  title: 'Custom Components/HighlightKeyword',
  component: HighlightKeyword,
  args: { text: 'React react REACT：高亮匹配到的原始文本。', keyword: 'React', caseSensitive: true },
  argTypes: {
    text: { control: 'text', description: '原始文本，不会作为 HTML 解析。' },
    keyword: { control: 'text', description: '字面量关键词；去除首尾空白后为空则不高亮。' },
    caseSensitive: { control: 'boolean', description: '是否区分大小写，默认 true。' },
    className: { control: 'text', description: '仅作用于高亮的 mark 元素。' },
  },
  // Controls 修改初始参数时重建演示；在页面内输入时使用局部状态，不影响其他 Story。
  render: (args) => <Playground key={JSON.stringify(args)} {...args} />,
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
          '对所有不重叠的关键词匹配添加 mark 高亮，保留原文大小写；默认区分大小写。下面的示例可以直接修改文本和关键词，观察匹配规则。组件本身不渲染输入控件、不筛选数据，也不解析 HTML。',
      },
    },
  },
} satisfies Meta<typeof HighlightKeyword>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const result = canvas.getByTestId('sensitive-result');
    await expect(result.querySelectorAll('mark')).toHaveLength(1);
    await userEvent.click(canvas.getByRole('switch', { name: '区分大小写' }));
    const insensitive = canvas.getByTestId('insensitive-result');
    await expect(insensitive.querySelectorAll('mark')).toHaveLength(3);
    await expect([...insensitive.querySelectorAll('mark')].map((mark) => mark.textContent)).toEqual([
      'React',
      'react',
      'REACT',
    ]);
    await userEvent.clear(canvas.getByRole('textbox', { name: '关键词' }));
    await expect(insensitive.querySelectorAll('mark')).toHaveLength(0);
    await expect(insensitive).toHaveTextContent('React react REACT');
  },
};
export const CaseComparison: Story = {
  render: (args) => <Playground key={JSON.stringify(args)} {...args} compare />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const sensitive = canvas.getByTestId('sensitive-result');
    const insensitive = canvas.getByTestId('insensitive-result');
    await expect(sensitive.querySelectorAll('mark')).toHaveLength(1);
    await expect(insensitive.querySelectorAll('mark')).toHaveLength(3);
    await userEvent.clear(canvas.getByRole('textbox', { name: '关键词' }));
    await userEvent.type(canvas.getByRole('textbox', { name: '关键词' }), 'REACT');
    await expect(sensitive.querySelector('mark')).toHaveTextContent('REACT');
    await expect(insensitive.querySelectorAll('mark')).toHaveLength(3);
  },
};
export const SpecialCharacters: Story = {
  args: { text: '.*+?^${}()|[]\\', keyword: '[' },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '关键词' });
    const result = canvas.getByTestId('sensitive-result');
    // 逐个输入元字符，确认按字面量匹配；paste 避免 userEvent 将方括号解释为键盘语法。
    for (const character of '.*+?^${}()|[]\\') {
      await userEvent.clear(input);
      await userEvent.paste(character);
      await expect(result.querySelectorAll('mark')).toHaveLength(1);
      await expect(result.querySelector('mark')).toHaveTextContent(character);
    }
  },
};
export const ChineseAndEmoji: Story = {
  args: { text: '你好，组件库。你好，世界。🌟 让组件更好用 🌟', keyword: '你好' },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const result = canvas.getByTestId('sensitive-result');
    await expect(result.querySelectorAll('mark')).toHaveLength(2);
    const input = canvas.getByRole('textbox', { name: '关键词' });
    await userEvent.clear(input);
    await userEvent.type(input, '🌟');
    await expect(result.querySelectorAll('mark')).toHaveLength(2);
    await expect(result.querySelector('mark')).toHaveTextContent('🌟');
  },
};
export const EmptyKeyword: Story = {
  args: { keyword: '   ' },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const result = canvas.getByTestId('sensitive-result');
    await expect(result.querySelectorAll('mark')).toHaveLength(0);
    await userEvent.clear(canvas.getByRole('textbox', { name: '原文' }));
    await expect(result.textContent).toBe('');
  },
};
export const NonOverlapping: Story = {
  args: { text: 'aaaaa', keyword: 'aa' },
  parameters: {
    docs: { description: { story: 'aaaaa 中匹配两段 aa，最后一个 a 保持原样；可修改文本验证相邻与重复匹配。' } },
  },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    const result = canvas.getByTestId('sensitive-result');
    await expect(result.querySelectorAll('mark')).toHaveLength(2);
    await expect(result.textContent).toBe('aaaaa');
  },
};
export const LiteralHtml: Story = {
  args: { text: '<strong>React</strong> & <script>alert("x")</script>', keyword: '<script>' },
  parameters: {
    docs: {
      description: { story: '标签作为普通文本显示，不产生 HTML 元素；可修改标签内容与关键词，验证字面量匹配。' },
    },
  },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    const result = canvas.getByTestId('sensitive-result');
    await expect(result.querySelector('strong, script')).not.toBeInTheDocument();
    await expect(result.querySelector('mark')).toHaveTextContent('<script>');
    await expect(result.textContent).toBe('<strong>React</strong> & <script>alert("x")</script>');
  },
};
