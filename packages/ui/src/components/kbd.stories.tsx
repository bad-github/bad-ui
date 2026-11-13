import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ArrowUpIcon, CornerDownLeftIcon, SearchIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Kbd, KbdGroup } from './kbd';
import { Button } from './button';

function ButtonExample() {
  const [opened, setOpened] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button variant="outline" onClick={() => setOpened((value) => !value)}>
        <SearchIcon data-icon="inline-start" aria-hidden="true" />
        搜索文档
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <p role="status">{opened ? '搜索入口已打开' : '点击按钮打开搜索入口'}</p>
    </div>
  );
}

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  args: { children: '⌘' },
  argTypes: { children: { control: 'text', description: '按键名称或符号。' } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '用于展示按键提示，KbdGroup 将多个按键组合为快捷键。它们仅负责展示，不注册键盘事件；实际快捷键需由调用方实现。图标按键可用 sr-only 文本补充易读名称。',
      },
    },
  },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Group: Story = {
  render: () => (
    <KbdGroup role="group" aria-label="Control 加 Shift 加 P">
      <Kbd>Ctrl</Kbd>
      <span aria-hidden="true">+</span>
      <Kbd>Shift</Kbd>
      <span aria-hidden="true">+</span>
      <Kbd>P</Kbd>
    </KbdGroup>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Kbd>
        <ArrowUpIcon aria-hidden="true" />
        <span className="sr-only">向上箭头</span>
      </Kbd>
      <Kbd>
        <CornerDownLeftIcon aria-hidden="true" />
        Enter
      </Kbd>
      <Kbd>Esc</Kbd>
    </div>
  ),
};

export const InlineText: Story = {
  render: () => (
    <p className="text-sm leading-7">
      按 <Kbd>Tab</Kbd> 移动焦点，按 <Kbd>Enter</Kbd> 确认，按 <Kbd>Esc</Kbd> 关闭弹层。
    </p>
  ),
};

export const InButton: Story = {
  render: () => <ButtonExample />,
  parameters: { docs: { description: { story: '快捷键仅作视觉提示，此示例只响应按钮点击。' } } },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: /搜索文档/ }));
    await expect(canvas.getByRole('status')).toHaveTextContent('搜索入口已打开');
  },
};

export const ShortcutList: Story = {
  render: () => (
    <dl className="flex flex-col gap-4 text-sm">
      {[
        { title: '搜索（macOS）', keys: ['⌘', 'K'], label: 'Command 加 K' },
        { title: '搜索（Windows / Linux）', keys: ['Ctrl', 'K'], label: 'Control 加 K' },
        { title: '关闭', keys: ['Esc'], label: 'Escape' },
      ].map(({ title, keys, label }) => (
        <div key={title} className="flex flex-wrap items-center justify-between gap-3">
          <dt>{title}</dt>
          <dd>
            <KbdGroup role="group" aria-label={label}>
              {keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </KbdGroup>
          </dd>
        </div>
      ))}
    </dl>
  ),
};
