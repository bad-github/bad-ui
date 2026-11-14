import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from './message-scroller';
import { Message, MessageContent, MessageHeader } from './message';
import { Bubble, BubbleContent } from './bubble';
import { Button } from './button';

function Example({
  position = 'end',
  mode = 'conversation',
  autoScroll = true,
}: {
  position?: 'start' | 'end' | 'last-anchor';
  mode?: 'conversation' | 'short' | 'prepend' | 'streaming';
  autoScroll?: boolean;
}) {
  const [messages, setMessages] = useState(() =>
    Array.from({ length: mode === 'short' ? 2 : 12 }, (_, index) => ({
      id: index + 1,
      text:
        index % 2 === 0
          ? `第 ${index + 1} 条消息：请说明这个组件的使用方式。`
          : `第 ${index + 1} 条消息：组合 Provider、Viewport、Content 与 Item，即可获得消息滚动和定位能力。`,
    }))
  );
  return (
    <MessageScrollerProvider key={`${position}-${autoScroll}`} defaultScrollPosition={position} autoScroll={autoScroll}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setMessages((items) => {
                const id = (items.at(-1)?.id ?? 0) + 1;
                return [...items, { id, text: `第 ${id} 条消息：这是一条新追加的消息。` }];
              })
            }
          >
            追加消息
          </Button>
          {mode === 'prepend' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setMessages((items) => {
                  const first = items[0]?.id ?? 1;
                  return [
                    { id: first - 2, text: '更早的消息：此前讨论了组件布局。' },
                    { id: first - 1, text: '更早的消息：随后补充了交互说明。' },
                    ...items,
                  ];
                })
              }
            >
              加载两条历史消息
            </Button>
          )}
          {mode === 'streaming' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setMessages((items) =>
                  items.map((item, index) =>
                    index === items.length - 1 ? { ...item, text: `${item.text} 这是新到达的回复片段。` } : item
                  )
                )
              }
            >
              追加回复片段
            </Button>
          )}
        </div>
        <div className="h-80 min-h-0 rounded-lg border">
          <MessageScroller>
            <MessageScrollerViewport role="region" aria-label="消息列表" tabIndex={0} preserveScrollOnPrepend>
              <MessageScrollerContent className="p-4" aria-live="off">
                {messages.map(({ id, text }) => {
                  const align = id % 2 === 0 ? 'start' : 'end';
                  return (
                    <MessageScrollerItem key={id} messageId={String(id)} scrollAnchor={align === 'end'}>
                      <Message align={align}>
                        <MessageContent>
                          <MessageHeader>{align === 'end' ? '我' : '助手'}</MessageHeader>
                          <Bubble align={align} variant={align === 'end' ? 'default' : 'muted'}>
                            <BubbleContent>{text}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  );
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton direction="start" aria-label="回到开头" behavior="instant" />
            <MessageScrollerButton direction="end" aria-label="查看最新消息" behavior="instant" />
          </MessageScroller>
        </div>
        <p role="status" className="text-sm">
          当前共 {messages.length} 条消息
        </p>
      </div>
    </MessageScrollerProvider>
  );
}

const meta = {
  title: 'Components/MessageScroller',
  component: Example,
  render: (args) => <Example key={args.mode} {...args} />,
  args: { position: 'end', mode: 'conversation', autoScroll: true },
  argTypes: {
    position: { control: 'select', options: ['start', 'end', 'last-anchor'] },
    mode: { control: 'select', options: ['conversation', 'short', 'prepend', 'streaming'] },
  },
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
          '消息滚动容器，提供初始定位、自动跟随、历史消息位置保持，以及返回开头和最新消息的按钮。每条消息必须放在拥有稳定 messageId 的 Item 中，用户消息可标记 scrollAnchor。容器需明确高度。本示例通过按钮手动追加消息或模拟流式片段，不在浏览时自动生成内容。',
      },
      story: { height: 520 },
    },
  },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await waitFor(() => expect(canvas.getByRole('region', { name: '消息列表' })).toBeVisible());
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const viewport = canvas.getByRole('region', { name: '消息列表' });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    const startButton = canvas.getByRole('button', { name: '回到开头' });
    await waitFor(() => expect(startButton).toHaveAttribute('data-active', 'true'));
    await userEvent.click(startButton);
    await waitFor(() => expect(viewport.scrollTop).toBeLessThan(2));
    const endButton = canvas.getByRole('button', { name: '查看最新消息' });
    await waitFor(() => expect(endButton).toHaveAttribute('data-active', 'true'));
    await userEvent.click(endButton);
    await waitFor(() => expect(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop).toBeLessThan(2));
  },
};
export const StartAtTop: Story = { args: { position: 'start', autoScroll: false } };
export const LastAnchor: Story = { args: { position: 'last-anchor' } };
export const ShortConversation: Story = { args: { mode: 'short' } };
export const AppendMessages: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await waitFor(() => expect(canvas.getByRole('region', { name: '消息列表' })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: '追加消息' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('当前共 13 条消息');
    const viewport = canvas.getByRole('region', { name: '消息列表' });
    await waitFor(() => expect(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop).toBeLessThan(2));
  },
};
export const PrependHistory: Story = {
  args: { mode: 'prepend', autoScroll: false },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const viewport = canvas.getByRole('region', { name: '消息列表' });
    await waitFor(() => expect(viewport.scrollTop).toBeGreaterThan(0));
    const lastMessage = canvas.getByText(/^第 12 条消息/);
    await waitFor(() =>
      expect(lastMessage.getBoundingClientRect().bottom).toBeLessThanOrEqual(viewport.getBoundingClientRect().bottom)
    );
    const before = lastMessage.getBoundingClientRect().top;
    await userEvent.click(canvas.getByRole('button', { name: '加载两条历史消息' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('当前共 14 条消息');
    await waitFor(() => expect(Math.abs(lastMessage.getBoundingClientRect().top - before)).toBeLessThan(3));
  },
};
export const Streaming: Story = {
  args: { mode: 'streaming' },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await waitFor(() => expect(canvas.getByRole('region', { name: '消息列表' })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: '追加回复片段' }));
    await expect(canvas.getByText(/这是新到达的回复片段/)).toBeInTheDocument();
    await expect(canvas.getByRole('status')).toHaveTextContent('当前共 12 条消息');
  },
};
