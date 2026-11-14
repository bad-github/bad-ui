import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './resizable';
function Example({
  orientation = 'horizontal',
  withHandle = false,
  disabled = false,
  three = false,
  nested = false,
}: {
  orientation?: 'horizontal' | 'vertical';
  withHandle?: boolean;
  disabled?: boolean;
  three?: boolean;
  nested?: boolean;
}) {
  return (
    <div className="h-72 w-full rounded-lg border">
      <ResizablePanelGroup orientation={orientation} disabled={disabled}>
        <ResizablePanel defaultSize="35%" minSize="20%">
          <div className="flex h-full min-w-0 items-center justify-center p-4 text-sm">侧边栏</div>
        </ResizablePanel>
        <ResizableHandle aria-label="调整侧边栏尺寸" withHandle={withHandle} />
        <ResizablePanel minSize="20%">
          {nested ? (
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel minSize="20%">
                <div className="flex h-full items-center justify-center p-4 text-sm">编辑区</div>
              </ResizablePanel>
              <ResizableHandle aria-label="调整编辑区高度" withHandle />
              <ResizablePanel minSize="20%">
                <div className="flex h-full items-center justify-center p-4 text-sm">预览区</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="flex h-full min-w-0 items-center justify-center p-4 text-sm">主内容</div>
          )}
        </ResizablePanel>
        {three && (
          <>
            <ResizableHandle aria-label="调整详情区尺寸" withHandle={withHandle} />
            <ResizablePanel defaultSize="25%" minSize="15%">
              <div className="flex h-full min-w-0 items-center justify-center p-4 text-sm">详情区</div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
const meta = {
  title: 'Components/Resizable',
  component: Example,
  args: { orientation: 'horizontal', withHandle: false, disabled: false, three: false, nested: false },
  argTypes: { orientation: { control: 'select', options: ['horizontal', 'vertical'] } },
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
          '可调整尺寸的分栏。拖动分隔条或聚焦后使用方向键调整；设置最小尺寸避免面板消失。使用 orientation 指定方向；百分比尺寸需用带 % 的字符串，数值尺寸按像素处理。外层容器必须有明确高度。',
      },
      story: { height: 420 },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const handle = canvas.getByRole('separator', { name: '调整侧边栏尺寸' });
    const before = handle.getAttribute('aria-valuenow');
    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(handle.getAttribute('aria-valuenow')).not.toBe(before));
  },
};
export const Vertical: Story = { args: { orientation: 'vertical', withHandle: true } };
export const WithHandle: Story = { args: { withHandle: true } };
export const ThreePanels: Story = { args: { three: true, withHandle: true } };
export const Disabled: Story = { args: { disabled: true, withHandle: true } };
export const Nested: Story = { args: { nested: true, withHandle: true } };
