import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { expect, fn } from 'storybook/test';
import { FileTextIcon, XIcon, RotateCcwIcon, TriangleAlertIcon } from 'lucide-react';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { sampleImage } from '../../.storybook/testing/sample-image';
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
} from './attachment';
import { Spinner } from './spinner';

type AttachmentProps = ComponentProps<typeof Attachment>;
function FileExample({ name = '设计说明.pdf', ...args }: AttachmentProps & { name?: string }) {
  const state = args.state ?? 'done';
  const descriptions = {
    idle: '等待上传',
    uploading: '正在上传 · 45%',
    processing: '正在处理',
    error: '上传失败，请重试',
    done: 'PDF · 2.4 MB',
  };
  return (
    <Attachment {...args}>
      <AttachmentMedia>
        {state === 'uploading' || state === 'processing' ? (
          <Spinner aria-label={descriptions[state]} />
        ) : state === 'error' ? (
          <TriangleAlertIcon aria-hidden="true" />
        ) : (
          <FileTextIcon aria-hidden="true" />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{name}</AttachmentTitle>
        <AttachmentDescription>{descriptions[state]}</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}

function RemovableExample({ onRemove }: { onRemove: () => void }) {
  const [removed, setRemoved] = useState(false);
  return removed ? (
    <p role="status">附件已移除</p>
  ) : (
    <Attachment>
      <AttachmentMedia>
        <FileTextIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>设计说明.pdf</AttachmentTitle>
        <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction
          aria-label="移除设计说明.pdf"
          onClick={() => {
            onRemove();
            setRemoved(true);
          }}
        >
          <XIcon aria-hidden="true" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}

function RetryExample() {
  const [state, setState] = useState<'error' | 'done'>('error');
  return (
    <div className="flex flex-col gap-3">
      <Attachment state={state}>
        <AttachmentMedia>
          <FileTextIcon aria-hidden="true" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>设计说明.pdf</AttachmentTitle>
          <AttachmentDescription>{state === 'error' ? '上传失败' : '重试完成（模拟）'}</AttachmentDescription>
        </AttachmentContent>
        {state === 'error' && (
          <AttachmentActions>
            <AttachmentAction aria-label="重试上传" onClick={() => setState('done')}>
              <RotateCcwIcon aria-hidden="true" />
            </AttachmentAction>
          </AttachmentActions>
        )}
      </Attachment>
      <p className="text-sm text-muted-foreground">重试仅模拟状态变化，不发起网络请求。</p>
    </div>
  );
}

const meta = {
  title: 'Components/Attachment',
  component: Attachment,
  subcomponents: {
    AttachmentGroup,
    AttachmentMedia,
    AttachmentContent,
    AttachmentTitle,
    AttachmentDescription,
    AttachmentActions,
    AttachmentAction,
    AttachmentTrigger,
  },
  args: { state: 'done', size: 'default', orientation: 'horizontal' },
  argTypes: {
    state: { control: 'select', options: ['idle', 'uploading', 'processing', 'error', 'done'] },
    size: { control: 'select', options: ['default', 'sm', 'xs'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '附件展示组件，支持文件、图片、状态和操作。state 只影响展示，不会自动上传。Trigger 覆盖附件点击区域，Actions 位于其上方；为每个图标操作提供可访问名称。',
      },
    },
  },
  render: (args) => <FileExample {...args} />,
} satisfies Meta<typeof Attachment>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const States: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      {(['idle', 'uploading', 'processing', 'error', 'done'] as const).map((state) => (
        <FileExample {...args} key={state} state={state} />
      ))}
    </div>
  ),
};
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <FileExample {...args} key={size} size={size} name={`${size} · 设计说明.pdf`} />
      ))}
    </div>
  ),
};
export const Vertical: Story = { args: { orientation: 'vertical' } };
export const Image: Story = {
  render: (args) => (
    <Attachment {...args}>
      <AttachmentMedia variant="image">
        <img src={sampleImage} alt="UI 示例图片缩略图" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>preview.svg</AttachmentTitle>
        <AttachmentDescription>SVG · 示例图片</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  ),
};
export const VerticalImage: Story = { ...Image, args: { orientation: 'vertical' } };
export const LongName: Story = {
  render: (args) => (
    <div className="w-full max-w-64">
      <FileExample {...args} name="项目设计说明与交互规范最终确认版本-2026-11-12.pdf" />
    </div>
  ),
};
const onOpen = fn();
export const Clickable: Story = {
  render: (args) => (
    <Attachment {...args}>
      <AttachmentTrigger aria-label="预览设计说明.pdf" onClick={onOpen} />
      <AttachmentMedia>
        <FileTextIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>设计说明.pdf</AttachmentTitle>
        <AttachmentDescription>点击附件模拟预览</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    onOpen.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: '预览设计说明.pdf' }));
    await userEvent.keyboard('{Enter}');
    await expect(onOpen).toHaveBeenCalledTimes(2);
  },
};
const onRemove = fn();
export const Removable: Story = {
  render: () => <RemovableExample onRemove={onRemove} />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    onRemove.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: '移除设计说明.pdf' }));
    await expect(onRemove).toHaveBeenCalledOnce();
    await expect(canvas.getByRole('status')).toHaveTextContent('附件已移除');
  },
};
export const Retry: Story = {
  render: () => <RetryExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '重试上传' }));
    await expect(canvas.getByText('重试完成（模拟）')).toBeVisible();
    await expect(canvas.queryByRole('button', { name: '重试上传' })).not.toBeInTheDocument();
  },
};
export const Group: Story = {
  render: (args) => (
    <AttachmentGroup
      role="region"
      aria-label="已添加附件"
      tabIndex={0}
      className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {['设计说明.pdf', '接口文档.pdf', '交互规范.pdf', '测试报告.pdf'].map((name) => (
        <FileExample {...args} name={name} key={name} />
      ))}
    </AttachmentGroup>
  ),
};
