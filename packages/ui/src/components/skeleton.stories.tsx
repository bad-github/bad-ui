import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Skeleton } from './skeleton';
import { Button } from './button';
function Placeholder({ avatar = false }: { avatar?: boolean }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-4">
      {avatar && <Skeleton className="size-12 shrink-0 rounded-full" />}
      <div className="flex w-full flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
function LoadingExample() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div aria-busy={!loaded}>{loaded ? <p>组件文档已加载。</p> : <Placeholder avatar />}</div>
      <p role="status">{loaded ? '加载完成' : '正在加载文档'}</p>
      <Button variant="outline" onClick={() => setLoaded((value) => !value)}>
        {loaded ? '重新加载' : '完成加载'}
      </Button>
    </div>
  );
}
const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  render: () => (
    <div role="status" aria-label="正在加载内容">
      <Placeholder />
    </div>
  ),
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
          '内容加载占位，按最终内容预留尺寸，减少布局跳动。装饰占位对读屏隐藏，由外层状态文字说明加载过程。示例通过按钮切换，不使用自动计时。',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithAvatar: Story = {
  render: () => (
    <div role="status" aria-label="正在加载用户资料">
      <Placeholder avatar />
    </div>
  ),
};
export const Media: Story = {
  render: () => (
    <div role="status" aria-label="正在加载图片">
      <Skeleton aria-hidden="true" className="aspect-video w-full" />
    </div>
  ),
};
export const LoadingState: Story = {
  render: () => <LoadingExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '完成加载' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('加载完成');
    await expect(canvas.getByText('组件文档已加载。')).toBeVisible();
  },
};
