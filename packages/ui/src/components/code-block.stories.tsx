import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockFooter,
} from './code-block';
import { expect, fn } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
const code = 'import { Button } from "@badnpm/ui";\n\nexport const Demo = () => <Button>保存</Button>;';
function Example({
  size = 'default',
  variant = 'default',
  numbered = false,
  wrap = false,
}: {
  size?: 'default' | 'sm';
  variant?: 'default' | 'destructive';
  numbered?: boolean;
  wrap?: boolean;
}) {
  return (
    <CodeBlock size={size} variant={variant}>
      <CodeBlockHeader>
        <CodeBlockTitle>demo.tsx</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers={numbered} wrap={wrap}>
        {code}
      </CodeBlockContent>
      <CodeBlockFooter>TSX · 3 行示例</CodeBlockFooter>
    </CodeBlock>
  );
}
const meta = {
  title: 'Components/CodeBlock',
  component: Example,
  args: { size: 'default', variant: 'default', numbered: false, wrap: false },
  argTypes: {
    size: { control: 'select', options: ['default', 'sm'] },
    variant: { control: 'select', options: ['default', 'destructive'] },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '代码容器提供标题、操作、行号、换行和差异行。不会自动做语法高亮；复制依赖安全上下文的 Clipboard API。测试用替身验证复制，不改写系统剪贴板。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent, canvasElement }) => {
    if (!shouldRunInteractions) return;
    const clipboard = canvasElement.ownerDocument.defaultView!.navigator.clipboard;
    const write = fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(clipboard, 'writeText');
    Object.defineProperty(clipboard, 'writeText', { configurable: true, value: write });
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
      await expect(write).toHaveBeenCalledWith(code);
      await expect(await canvas.findByRole('button', { name: 'Copied' })).toBeVisible();
    } finally {
      if (original) Object.defineProperty(clipboard, 'writeText', original);
      else Reflect.deleteProperty(clipboard, 'writeText');
    }
  },
};
export const Small: Story = { args: { size: 'sm' } };
export const Numbered: Story = { args: { numbered: true } };
export const Wrapped: Story = { args: { wrap: true } };
export const Destructive: Story = { args: { variant: 'destructive' } };
export const Diff: Story = {
  render: () => (
    <CodeBlock>
      <CodeBlockContent lineNumbers startLine={10}>
        <CodeBlockLine variant="removed">const theme = "light";</CodeBlockLine>
        <CodeBlockLine variant="added">const theme = "system";</CodeBlockLine>
        <CodeBlockLine variant="highlighted">applyTheme(theme);</CodeBlockLine>
        <CodeBlockLine />
      </CodeBlockContent>
    </CodeBlock>
  ),
};
