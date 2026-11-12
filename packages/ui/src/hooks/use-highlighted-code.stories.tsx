import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { Button } from '../components/button';
import { useHighlightedCode } from './use-highlighted-code';

function HighlightedCodeExample({ code, language }: { code: string; language: string }) {
  const [suffix, setSuffix] = useState('');
  const [replacement, setReplacement] = useState<string | null>(null);
  const lines = useHighlightedCode(replacement ?? code + suffix, language);
  return (
    <section className="flex flex-col gap-4 p-6">
      <h2>useHighlightedCode</h2>
      <p>语言：{language}；加载完成前或语言不支持时显示纯文本。</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setSuffix((value) => value + '\nconsole.log(answer);')} disabled={replacement !== null}>
          追加一行
        </Button>
        <Button onClick={() => setReplacement('const replaced = true;')}>替换内容</Button>
        <Button
          variant="outline"
          onClick={() => {
            setSuffix('');
            setReplacement(null);
          }}
        >
          重置
        </Button>
      </div>
      <pre role="region" aria-label="高亮结果" className="overflow-auto rounded-md border p-4">
        <code>
          {lines.map((line, index) => (
            <span className="block min-h-[1lh]" key={index}>
              {line}
            </span>
          ))}
        </code>
      </pre>
      <p role="status">行数：{lines.length}</p>
    </section>
  );
}

const meta = {
  title: 'Hooks/useHighlightedCode',
  component: HighlightedCodeExample,
  args: { code: 'const answer = 42;\n', language: 'typescript' },
  argTypes: {
    code: { control: 'text' },
    language: { control: 'text', description: '支持完整语言名和 ts、js 等别名；未知语言退回纯文本。' },
  },
  parameters: {
    docs: {
      description: {
        component:
          '异步加载语言，按行返回 React 节点。流式追加复用已完成行的语法状态；内容替换会重新计算。末尾换行不会产生额外空行，可在 Controls 中切换语言或修改代码。',
      },
    },
  },
} satisfies Meta<typeof HighlightedCodeExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('行数：1');
    await waitFor(async () => {
      await expect(canvas.getByLabelText('高亮结果').querySelector('[style]')).not.toBeNull();
    });
  },
};

export const StreamingAndReplacement: Story = {
  args: { code: 'const answer = 42;' },
  play: async ({ canvas, userEvent }) => {
    const result = canvas.getByLabelText('高亮结果');
    await waitFor(async () => {
      await expect(result.querySelector('[style]')).not.toBeNull();
    });
    await userEvent.click(canvas.getByRole('button', { name: '追加一行' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('行数：2');
    await expect(result).toHaveTextContent('console.log(answer);');
    await userEvent.click(canvas.getByRole('button', { name: '替换内容' }));
    await expect(result).toHaveTextContent('const replaced = true;');
    await expect(result).not.toHaveTextContent('answer');
    await expect(canvas.getByRole('status')).toHaveTextContent('行数：1');
    await userEvent.click(canvas.getByRole('button', { name: '重置' }));
    await expect(result).toHaveTextContent('const answer = 42;');
  },
};

export const UnsupportedLanguage: Story = {
  args: { language: 'unknown-language', code: 'Plain text\nSecond line' },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('高亮结果')).toHaveTextContent('Plain text');
    await expect(canvas.getByRole('status')).toHaveTextContent('行数：2');
  },
};

export const Empty: Story = { args: { code: '' } };
