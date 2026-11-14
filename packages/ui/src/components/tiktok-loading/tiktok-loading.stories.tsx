import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../../.storybook/testing/interaction-mode';
import { Button } from '../button';
import { TiktokLoading, type TiktokLoadingProps } from './index';

const meta = {
  title: 'Custom Components/TiktokLoading',
  component: TiktokLoading,
  args: {
    type: 'svg',
    size: 'large',
    durationMs: 2000,
    baseRadius: 9,
    minRadius: 6,
    maxRadius: 12,
    travelRatio: 0.95,
    horizontalPaddingRatio: 0.25,
    verticalPaddingRatio: 0.25,
    redColor: '#fe2c55',
    cyanColor: '#25f4ee',
    overlapColor: '#101010',
    message: '加载中...',
  },
  argTypes: {
    type: { control: 'select', options: ['svg', 'html'], description: '两种渲染器共用动画计算。' },
    size: { control: 'select', options: ['small', 'middle', 'large'], description: '只缩放圆球，不缩放提示文字。' },
    durationMs: { control: { type: 'number', min: 1, step: 100 }, description: '完整往返的时长，单位毫秒。' },
    baseRadius: {
      control: { type: 'number', min: 1 },
      description: '基准半径，需满足 minRadius ≤ baseRadius ≤ maxRadius。',
    },
    minRadius: { control: { type: 'number', min: 1 }, description: '收缩半径，需大于 0 且不超过基准半径。' },
    maxRadius: { control: { type: 'number', min: 1 }, description: '放大半径，需不小于基准半径。' },
    travelRatio: { control: { type: 'number', min: 0, step: 0.05 }, description: '水平位移相对最大半径的比例。' },
    horizontalPaddingRatio: { control: { type: 'number', min: 0, step: 0.05 }, description: '左右留白比例。' },
    verticalPaddingRatio: { control: { type: 'number', min: 0, step: 0.05 }, description: '上下留白比例。' },
    redColor: { control: 'color', description: '红色圆球颜色。' },
    cyanColor: { control: 'color', description: '青色圆球颜色。' },
    overlapColor: { control: 'color', description: '交叠区域颜色。' },
    message: { control: 'text', description: '支持 ReactNode；null、空字符串或 false 可隐藏。' },
    messageClassName: { control: 'text', description: '提示文字容器类名。' },
    messageStyle: { control: 'object', description: '提示文字内联样式。' },
    style: { control: 'object' },
  },
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
          '双球往返加载动画，支持 SVG 和 HTML 渲染、自定义尺寸、周期与颜色。外层具有 status 语义，图形对辅助技术隐藏；可通过 aria-label 自定义可访问名称。系统开启“减少动态效果”时保留静态图形并停止动画循环，偏好变化时自动响应。',
      },
    },
  },
} satisfies Meta<typeof TiktokLoading>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Html: Story = { args: { type: 'html' } };
export const WithoutMessage: Story = { args: { message: null } };
export const CustomMessage: Story = {
  args: {
    message: <span>正在同步组件资源…</span>,
    'aria-label': '正在同步组件资源',
    messageStyle: { fontSize: 14 },
  },
};

export const RenderersAndSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      {(['svg', 'html'] as const).map((type) => (
        <section key={type} className="flex flex-col gap-4" aria-label={`${type} 尺寸`}>
          <h3 className="text-sm font-medium">{type.toUpperCase()}</h3>
          <div className="flex flex-wrap items-center justify-around gap-6">
            {(['small', 'middle', 'large'] as const).map((size) => (
              <TiktokLoading {...args} key={size} type={type} size={size} message={size} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!shouldRunInteractions) return;
    // 多个 SVG 同时挂载时，裁切 ID 必须独立且引用各自的裁切区域。
    const clips = [...canvasElement.querySelectorAll('clipPath')];
    await expect(clips).toHaveLength(3);
    await expect(new Set(clips.map((clip) => clip.id)).size).toBe(3);
    for (const clip of clips) {
      await expect(clip.closest('svg')?.querySelector('[clip-path]')).toHaveAttribute('clip-path', `url(#${clip.id})`);
    }
  },
};

export const Durations: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center justify-around gap-6">
      {[1000, 2000, 3000].map((durationMs) => (
        <TiktokLoading {...args} key={durationMs} durationMs={durationMs} message={`${durationMs} ms`} />
      ))}
    </div>
  ),
};

export const ThemeColors: Story = {
  args: { redColor: 'var(--primary)', cyanColor: 'var(--muted-foreground)', overlapColor: 'var(--foreground)' },
  parameters: {
    docs: { description: { story: '使用主题变量替换品牌色，可通过 Storybook 工具栏切换深浅主题查看效果。' } },
  },
};

function SwitchRendererExample(args: TiktokLoadingProps) {
  const [switched, setSwitched] = useState(false);
  const type = switched ? (args.type === 'html' ? 'svg' : 'html') : args.type;
  return (
    <div className="flex flex-col gap-6">
      <Button variant="outline" onClick={() => setSwitched((value) => !value)}>
        切换渲染器
      </Button>
      {/* 保持同一个 TiktokLoading 实例，只切换 type，避免重置由 Base 持有的动画相位。 */}
      <TiktokLoading {...args} type={type} />
    </div>
  );
}

export const SwitchRenderer: Story = {
  render: (args) => <SwitchRendererExample {...args} />,
  parameters: {
    docs: { description: { story: '在 SVG 与 HTML 之间切换，观察动画沿用当前相位。切换按钮支持键盘操作。' } },
  },
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const status = canvas.getByRole('status', { name: '加载中' });
    const button = canvas.getByRole('button', { name: '切换渲染器' });
    await step('点击切换为 HTML，保留状态提示', async () => {
      await expect(status.querySelector('svg')).toBeInTheDocument();
      await userEvent.click(button);
      await expect(status.querySelector('svg')).not.toBeInTheDocument();
      await expect(status).toHaveTextContent('加载中...');
    });
    await step('键盘切换回 SVG', async () => {
      button.focus();
      await userEvent.keyboard('{Enter}');
      await expect(status.querySelector('svg')).toBeInTheDocument();
    });
  },
};
