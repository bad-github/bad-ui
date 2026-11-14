import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileTextIcon, SearchIcon, ClockIcon, CircleAlertIcon, ArrowUpRightIcon } from 'lucide-react';
import { expect, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Trace,
  TraceLine,
  TraceIcon,
  TraceTitle,
  TraceDescription,
  TraceCollapsible,
  TraceCollapsibleTrigger,
  TraceCollapsibleContent,
} from './trace';
function Example({ status }: { status?: 'running' | 'error' | 'pending' }) {
  return (
    <Trace>
      <TraceLine status={status}>
        <TraceIcon>
          {status === 'running' ? (
            <SearchIcon />
          ) : status === 'error' ? (
            <CircleAlertIcon />
          ) : status === 'pending' ? (
            <ClockIcon />
          ) : (
            <FileTextIcon />
          )}
        </TraceIcon>
        <TraceTitle>
          {status === 'running'
            ? '正在搜索组件文档'
            : status === 'error'
              ? '读取文档失败'
              : status === 'pending'
                ? '等待检查示例'
                : '已读取组件文档'}
        </TraceTitle>
      </TraceLine>
    </Trace>
  );
}
const meta = {
  title: 'Components/Trace',
  component: Example,
  argTypes: { status: { control: 'select', options: [undefined, 'running', 'error', 'pending'] } },
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
          '展示工具活动和执行步骤，运行、失败、等待状态通过明确文案表达；无 status 表示普通已完成行。可展开内容使用 TraceCollapsible；状态演示是静态的，不启动真实任务。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Running: Story = { args: { status: 'running' } };
export const Error: Story = { args: { status: 'error' } };
export const Pending: Story = { args: { status: 'pending' } };
export const Collapsible: Story = {
  render: () => (
    <Trace>
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <FileTextIcon />
            </TraceIcon>
            <TraceTitle>已读取组件文档</TraceTitle>
            <TraceDescription>3 个文件</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <p className="text-sm">已检查按钮、输入框和选择器的使用说明。</p>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: /已读取组件文档/ });
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByText('已检查按钮、输入框和选择器的使用说明。')).toBeVisible());
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
export const WithLink: Story = {
  render: () => (
    <Trace>
      <a href="https://github.com/bad-github/bad-ui" target="_blank" rel="noreferrer">
        <TraceLine>
          <TraceIcon>
            <FileTextIcon />
          </TraceIcon>
          <TraceTitle>
            查看组件仓库<span className="sr-only">（在新标签页打开）</span>
          </TraceTitle>
          <TraceIcon>
            <ArrowUpRightIcon />
          </TraceIcon>
        </TraceLine>
      </a>
    </Trace>
  ),
};
