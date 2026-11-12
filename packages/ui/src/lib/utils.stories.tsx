import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { cn } from './utils';

function ClassNamesExample() {
  return (
    <section className="flex flex-col gap-4" style={{ padding: 24 }}>
      <h2>cn 类名组合</h2>
      <p>本模块转发 cn 库的工具函数，用于组合类名；详细规则由上游实现决定。</p>
      <p>组合结果：<output aria-label="类名组合结果">{cn('flex', 'gap-2')}</output></p>
    </section>
  );
}

const meta = {
  title: 'Lib/Utils',
  component: ClassNamesExample,
  parameters: { docs: { description: { component: '展示项目公开工具入口的导入和使用，不对无实现逻辑的转发文件重复编写上游库的完整测试。' } } },
} satisfies Meta<typeof ClassNamesExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ClassNames: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('类名组合结果')).toHaveTextContent('flex gap-2');
  },
};
