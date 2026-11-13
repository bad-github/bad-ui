import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Message, MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter } from './message';
import { Bubble, BubbleContent } from './bubble';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import { Marker, MarkerContent } from './marker';

function Example({
  align = 'start',
  avatar = true,
  text = '组件示例已准备好，可以开始查看了。',
}: {
  align?: 'start' | 'end';
  avatar?: boolean;
  text?: string;
}) {
  return (
    <Message align={align}>
      {avatar && (
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>{align === 'end' ? '我' : '林'}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
      )}
      <MessageContent>
        <MessageHeader>{align === 'end' ? '我' : '小林'}</MessageHeader>
        <Bubble align={align} variant={align === 'end' ? 'default' : 'muted'}>
          <BubbleContent>{text}</BubbleContent>
        </Bubble>
        <MessageFooter>
          <time dateTime="2026-11-13T10:30:00+08:00">10:30</time>
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}

function ActionsExample() {
  const [saved, setSaved] = useState(false);
  return (
    <Message>
      <MessageContent>
        <MessageHeader>小林</MessageHeader>
        <Bubble variant="muted">
          <BubbleContent>这份使用说明可以收藏，稍后继续阅读。</BubbleContent>
        </Bubble>
        <MessageFooter>
          <Button size="sm" variant="ghost" aria-pressed={saved} onClick={() => setSaved((value) => !value)}>
            {saved ? '已收藏' : '收藏消息'}
          </Button>
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}

const meta = {
  title: 'Components/Message',
  component: Example,
  args: { align: 'start', avatar: true, text: '组件示例已准备好，可以开始查看了。' },
  argTypes: { align: { control: 'select', options: ['start', 'end'] } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '消息行组合头像、发送者、Bubble 内容和页脚；align=end 表示当前用户。MessageGroup 用于组织连续消息。需要滚动的完整会话应使用 MessageScroller；示例中的收藏仅更新本地状态。',
      },
      story: { height: 420 },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Outgoing: Story = { args: { align: 'end', text: '收到，我会检查各个示例的展示效果。' } };
export const WithoutAvatar: Story = { args: { avatar: false } };
export const Group: Story = {
  render: () => (
    <MessageGroup>
      <Example text="基础组件已整理完成。" />
      <Example avatar={false} text="接下来可以查看菜单与消息组件。" />
    </MessageGroup>
  ),
};
export const Conversation: Story = {
  render: () => (
    <MessageGroup>
      <Marker variant="separator">
        <MarkerContent>今天</MarkerContent>
      </Marker>
      <Example text="消息组件支持左右两侧对齐。" />
      <Example align="end" text="明白，我会一起检查头像、时间和长文本的布局。" />
    </MessageGroup>
  ),
};
export const WithActions: Story = {
  render: () => <ActionsExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const button = canvas.getByRole('button', { name: '收藏消息' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveTextContent('已收藏');
  },
};
