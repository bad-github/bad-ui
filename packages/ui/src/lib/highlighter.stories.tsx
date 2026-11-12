import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState, type ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';
import { highlightCode, loadHighlighter } from './highlighter';

function HighlighterExample({ code, language, incremental }: { code: string; language: string; incremental: boolean }) {
  // 输入变化时重建示例，立即显示加载状态，避免旧结果或错误残留。
  return <HighlighterPreview key={JSON.stringify([code, language, incremental])} code={code} language={language} incremental={incremental} />;
}

function HighlighterPreview({ code, language, incremental }: { code: string; language: string; incremental: boolean }) {
  const [result, setResult] = useState<{ lines: ReactNode[]; supported: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!incremental) {
        const lines = await highlightCode(code, language);
        return { lines: lines ?? code.split('\n'), supported: lines !== null };
      }
      const highlighter = await loadHighlighter(language);
      if (!highlighter) return { lines: code.split('\n'), supported: false };
      // 调用方保存上一行的 grammar state，再交给下一次 highlight。
      let state: Parameters<typeof highlighter.highlight>[1];
      const lines = code.split('\n').flatMap((line) => {
        const next = highlighter.highlight(line, state);
        state = next.state;
        return next.lines;
      });
      return { lines, supported: true };
    }

    run()
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [code, language, incremental]);

  return (
    <section className="flex flex-col gap-4 p-6">
      <h2>{incremental ? 'loadHighlighter：逐行高亮' : 'highlightCode：完整代码高亮'}</h2>
      <p>语言：{language}。可切换预览主题查看浅色与深色高亮。</p>
      <p role="status">
        {error
          ? `加载失败：${error}`
          : !result
            ? '加载中'
            : result.supported
              ? '高亮完成'
              : '不支持此语言，回退为纯文本'}
      </p>
      <pre role="region" aria-label="高亮结果" className="overflow-auto rounded-md border p-4 text-2xl">
        <code>
          {result?.lines.map((line, index) => (
            <span key={index} className="block min-h-[1lh]">
              {line}
            </span>
          ))}
        </code>
      </pre>
    </section>
  );
}

const meta = {
  title: 'Lib/Highlighter',
  component: HighlighterExample,
  args: { code: 'const answer: number = 42;\nconsole.log(answer);', language: 'typescript', incremental: false },
  argTypes: { code: { control: 'text' }, language: { control: 'text' }, incremental: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component:
          'highlightCode 返回逐行 React 节点，未知语言返回 null；loadHighlighter 返回可复用的高亮器及跨行语法状态。语言按需加载，支持 ts、js、sh 等别名及 ANSI 转义颜色。本示例由调用方处理加载、错误与纯文本回退。',
      },
    },
  },
} satisfies Meta<typeof HighlighterExample>;
export default meta;
type Story = StoryObj<typeof meta>;

const checkHighlight: NonNullable<Story['play']> = async ({ canvas }) => {
  if (!shouldRunInteractions) return;
  // 首次加载 Shiki 和语言文件，在覆盖率或 CI 模式下可能超过默认的 1 秒。
  await waitFor(async () => {
    await expect(canvas.getByRole('status')).toHaveTextContent('高亮完成');
  }, { timeout: 10000 });
  await expect(canvas.getByLabelText('高亮结果').querySelector('[style]')).not.toBeNull();
};

export const Default: Story = { play: checkHighlight };
export const LanguageAlias: Story = { args: { language: 'TS' }, play: checkHighlight };
export const Incremental: Story = {
  args: { incremental: true, code: '/* first line\nstill a comment */\nconst answer = 42;' },
  play: async (context) => {
    if (!shouldRunInteractions) return;
    await checkHighlight(context);
    const highlighter = await loadHighlighter('typescript');
    if (!highlighter) throw new Error('TypeScript highlighter unavailable');
    const first = highlighter.highlight('/* first line');
    const next = highlighter.highlight('still a comment */', first.state);
    const whole = highlighter.highlight('/* first line\nstill a comment */');
    // 跨行注释的逐行结果应与完整高亮一致，而非当成独立代码处理。
    await expect(next.lines[0]).toEqual(whole.lines[1]);
  },
};
export const Ansi: Story = {
  args: { language: 'ansi', code: '\u001b[32mBuild passed\u001b[0m\n\u001b[31mExample error\u001b[0m' },
  play: checkHighlight,
};
export const UnsupportedLanguage: Story = {
  args: { language: 'unknown-language', code: 'Plain text fallback' },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await waitFor(async () => {
      await expect(canvas.getByRole('status')).toHaveTextContent('不支持此语言');
    });
    await expect(canvas.getByLabelText('高亮结果')).toHaveTextContent('Plain text fallback');
    await expect(await highlightCode('plain', 'unknown-language')).toBeNull();
    await expect(await loadHighlighter('unknown-language')).toBeNull();
  },
};
export const Empty: Story = {
  args: { code: '' },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await waitFor(async () => {
      await expect(canvas.getByRole('status')).toHaveTextContent('高亮完成');
    });
    await expect(canvas.getByLabelText('高亮结果')).toHaveTextContent('');
  },
};
