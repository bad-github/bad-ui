import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { useIsMobile } from './use-mobile';

function MobileExample() {
  const isMobile = useIsMobile();
  return (
    <section className="flex flex-col gap-4 p-6">
      <h2>useIsMobile</h2>
      <p role="status">当前视口：{isMobile ? '移动端' : '桌面端'}</p>
      <p>调整预览 iframe 的宽度：小于 768px 返回 true，768px 及以上返回 false。</p>
      <p>判断依据是视口宽度，不是设备类型；首次渲染返回 false，挂载后更新。</p>
    </section>
  );
}

const meta = {
  title: 'Hooks/useIsMobile',
  component: MobileExample,
  parameters: {
    docs: {
      description: {
        component: '监听 matchMedia 的断点变化。可调整浏览器或预览视口宽度，观察跨越 768px 时的返回值变化。',
      },
    },
  },
} satisfies Meta<typeof MobileExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Responsive: Story = {
  play: async ({ canvas, canvasElement }) => {
    // 从示例自身的 iframe 读取宽度，避免误用 Storybook 管理页面的视口。
    const view = canvasElement.ownerDocument.defaultView!;
    await waitFor(async () => {
      await expect(canvas.getByRole('status')).toHaveTextContent(
        `当前视口：${view.innerWidth < 768 ? '移动端' : '桌面端'}`
      );
    });
  },
};
