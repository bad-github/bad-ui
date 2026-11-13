import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FolderOpenIcon, SearchIcon, WifiOffIcon, PlusIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from './empty';
import { Button } from './button';
import { Spinner } from './spinner';
import { Avatar, AvatarFallback } from './avatar';
function Example({
  kind = 'projects',
  bordered = false,
}: {
  kind?: 'projects' | 'search' | 'offline' | 'loading' | 'team';
  bordered?: boolean;
}) {
  const [complete, setComplete] = useState(false);
  if (complete)
    return (
      <p role="status">
        {kind === 'offline'
          ? '重试完成（模拟），网络状态未实际检测。'
          : kind === 'search'
            ? '已清除筛选条件'
            : '已创建示例项目'}
      </p>
    );
  const content = {
    projects: { title: '还没有项目', description: '创建第一个项目，开始整理组件和文档。' },
    search: { title: '没有匹配的结果', description: '试试其他关键词，或清除筛选条件。' },
    offline: { title: '暂时无法加载', description: '请检查网络后重试，已有内容不会丢失。' },
    loading: { title: '正在准备内容', description: '这是一条静态加载示例，不会自动完成。' },
    team: { title: '邀请成员一起协作', description: '目前没有其他成员加入项目。' },
  }[kind];
  return (
    <Empty className={bordered ? 'border' : ''}>
      <EmptyHeader>
        <EmptyMedia variant={kind === 'team' ? 'default' : 'icon'}>
          {kind === 'loading' ? (
            <Spinner aria-label="加载中" />
          ) : kind === 'search' ? (
            <SearchIcon aria-hidden="true" />
          ) : kind === 'offline' ? (
            <WifiOffIcon aria-hidden="true" />
          ) : kind === 'team' ? (
            <Avatar size="lg" aria-label="成员占位头像">
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
          ) : (
            <FolderOpenIcon aria-hidden="true" />
          )}
        </EmptyMedia>
        <EmptyTitle>{content.title}</EmptyTitle>
        <EmptyDescription>{content.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {kind === 'projects' ? (
          <Button onClick={() => setComplete(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            创建项目
          </Button>
        ) : kind === 'offline' ? (
          <Button variant="outline" onClick={() => setComplete(true)}>
            重试加载
          </Button>
        ) : kind === 'search' ? (
          <Button variant="outline" onClick={() => setComplete(true)}>
            清除筛选
          </Button>
        ) : kind === 'team' ? (
          <Button render={<a href="https://github.com/bad-github/bad-ui" />}>查看项目</Button>
        ) : null}
      </EmptyContent>
    </Empty>
  );
}
const meta = {
  title: 'Components/Empty',
  component: Example,
  args: { kind: 'projects', bordered: false },
  argTypes: { kind: { control: 'select', options: ['projects', 'search', 'offline', 'loading', 'team'] } },
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
          '空状态展示，组合媒体、标题、说明与操作区。区分尚无内容、搜索无结果和加载失败；示例操作仅更新本地状态，不发送请求。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '创建项目' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已创建示例项目');
  },
};
export const Bordered: Story = { args: { bordered: true } };
export const NoResults: Story = { args: { kind: 'search' } };
export const ConnectionError: Story = {
  args: { kind: 'offline' },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '重试加载' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('重试完成（模拟）');
  },
};
export const Loading: Story = { args: { kind: 'loading' } };
export const Team: Story = { args: { kind: 'team' } };
