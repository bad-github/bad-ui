import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ThumbsUpIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from './bubble';
import { Button } from './button';

const variants = ['default', 'secondary', 'muted', 'tinted', 'outline', 'ghost', 'destructive'] as const;
function ReactionExample() {
  const [liked, setLiked] = useState(false);
  return (
    <Bubble variant="secondary">
      <BubbleContent>这个方案可以继续完善。</BubbleContent>
      <BubbleReactions>
        <Button
          size="xs"
          variant="ghost"
          aria-pressed={liked}
          onClick={() => setLiked((value) => !value)}
        >
          <ThumbsUpIcon data-icon="inline-start" aria-hidden="true" />
          赞同 {liked ? 1 : 0}
        </Button>
      </BubbleReactions>
    </Bubble>
  );
}
const meta = {
  title: 'Components/Bubble',
  component: Bubble,
  subcomponents: { BubbleGroup, BubbleContent, BubbleReactions },
  args: { variant: 'default', align: 'start' },
  argTypes: {
    variant: { control: 'select', options: variants },
    align: { control: 'radio', options: ['start', 'end'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="flex w-full max-w-xl flex-col gap-6 p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '消息气泡，由 Bubble 与 BubbleContent 组合。BubbleGroup 容纳连续气泡，align 控制起止方向；BubbleReactions 展示反馈，交互状态由调用方管理。',
      },
    },
  },
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent>你好，欢迎体验组件库。</BubbleContent>
    </Bubble>
  ),
} satisfies Meta<typeof Bubble>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Variants: Story = {
  render: () => (
    <>
      {variants.map((variant) => (
        <Bubble key={variant} variant={variant}>
          <BubbleContent>{variant} · 这是一条示例消息。</BubbleContent>
        </Bubble>
      ))}
    </>
  ),
};
export const Alignment: Story = {
  render: () => (
    <BubbleGroup>
      <Bubble variant="secondary">
        <BubbleContent>文档已经准备好了。</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>收到，我来检查一下。</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};
export const Group: Story = {
  render: () => (
    <BubbleGroup>
      <Bubble variant="secondary">
        <BubbleContent>先运行类型检查。</BubbleContent>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent>然后构建 Storybook。</BubbleContent>
      </Bubble>
      <Bubble variant="secondary">
        <BubbleContent>最后检查静态预览。</BubbleContent>
      </Bubble>
    </BubbleGroup>
  ),
};
export const LongContent: Story = {
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent>
        <p>这是一条包含多段内容的消息，宽度受气泡容器限制，内容会自然换行。</p>
        <p>请检查不同屏幕下的阅读体验，长文本不会撑开整个页面。</p>
      </BubbleContent>
    </Bubble>
  ),
};
export const Reactions: Story = {
  render: () => <ReactionExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const button = canvas.getByRole('button', { name: /^赞同/ });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveTextContent('1');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  },
};
export const ReactionPositions: Story = {
  render: () => (
    <>
      {(['top', 'bottom'] as const).map((side) => (
        <Bubble key={side} variant="outline">
          <BubbleContent>{side} 位置的反馈</BubbleContent>
          <BubbleReactions side={side} align="start">
            <ThumbsUpIcon className="size-3" aria-hidden="true" />
            <span>2</span>
          </BubbleReactions>
        </Bubble>
      ))}
    </>
  ),
};
export const InteractiveContent: Story = {
  render: (args) => (
    <Bubble {...args}>
      <BubbleContent render={<a href="https://github.com/bad-github/bad-ui" />}>查看组件库源码</BubbleContent>
    </Bubble>
  ),
};
