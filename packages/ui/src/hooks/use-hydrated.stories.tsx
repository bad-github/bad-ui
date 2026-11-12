import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { useHydrated } from './use-hydrated';

function HydrationExample() {
  // Hook 不能作为普通函数直接调用，因此通过 React 消费组件展示它的返回值。
  const hydrated = useHydrated();
  return (
    <section className="flex flex-col gap-4" style={{ padding: 24 }}>
      <h2>useHydrated</h2>
      <p role="status">客户端已就绪：{String(hydrated)}</p>
      <p>纯客户端渲染返回 true；服务端和水合首帧通过服务端快照返回 false。</p>
    </section>
  );
}

const meta = {
  title: 'Hooks/useHydrated',
  component: HydrationExample,
  parameters: { docs: { description: { component: '基于 useSyncExternalStore 区分服务端快照和客户端快照。此分组展示客户端用法；SSR 与真实水合需另外建立对应运行环境。' } } },
} satisfies Meta<typeof HydrationExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ClientRendering: Story = {
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('status')).toHaveTextContent('客户端已就绪：true');
  },
};
