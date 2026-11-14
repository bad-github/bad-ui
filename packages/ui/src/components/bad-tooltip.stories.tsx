import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { BadTooltip, type BadTooltipProps } from './bad-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Button } from './button';
import { Textarea } from './textarea';
import { Field, FieldLabel, FieldDescription } from './field';

function InteractiveExample(args: BadTooltipProps) {
  const id = useId();
  const [message, setMessage] = useState(String(args.content.children ?? ''));
  const [lastEvent, setLastEvent] = useState('尚未操作');
  return (
    <div className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor={id}>提示内容</FieldLabel>
        <Textarea id={id} value={message} onChange={(event) => setMessage(event.currentTarget.value)} />
        <FieldDescription>修改文字，再悬停或用 Tab 聚焦按钮查看；Escape 可关闭提示。</FieldDescription>
      </Field>
      <div className="self-start">
        <BadTooltip
          {...args}
          content={{ ...args.content, children: message }}
          onOpenChange={(open, details) => {
            setLastEvent(`${open ? '打开' : '关闭'}（${details.reason}）`);
            args.onOpenChange?.(open, details);
          }}
        />
      </div>
      <p className="text-sm text-muted-foreground">最近一次开关事件：{lastEvent}</p>
    </div>
  );
}

function ComparisonExample() {
  const id = useId();
  const [message, setMessage] = useState(
    'https://example.com/components/VeryLongKeywordWithoutSpacesForTestingTooltipWrapping'
  );
  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor={id}>两侧共用的提示内容</FieldLabel>
        <Textarea id={id} value={message} onChange={(event) => setMessage(event.currentTarget.value)} />
        <FieldDescription>
          分别悬停或聚焦下方按钮，比较长网址等连续文本的换行；也可以换成普通说明文字。
        </FieldDescription>
      </Field>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="flex flex-col items-start gap-3" aria-label="原始 Tooltip 示例">
          <h3 className="text-sm font-medium">Tooltip</h3>
          <p className="text-sm text-muted-foreground">手动组合 Provider、Trigger 和 Content；长串换行需自行设置。</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" />}>原始 Tooltip</TooltipTrigger>
              <TooltipContent role="tooltip">{message}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </section>
        <section className="flex flex-col items-start gap-3" aria-label="BadTooltip 示例">
          <h3 className="text-sm font-medium">BadTooltip</h3>
          <p className="text-sm text-muted-foreground">
            通过 trigger、content 配置；内置独立 Provider 和长串换行样式。
          </p>
          <BadTooltip
            trigger={{ render: <Button variant="outline" />, children: 'BadTooltip' }}
            content={{ role: 'tooltip', children: message }}
          />
        </section>
      </div>
      <p className="text-sm text-muted-foreground">
        普通文字的视觉效果与基础组件一致。必需说明应直接展示；交互内容请使用 Popover。
      </p>
    </div>
  );
}

const meta = {
  title: 'Custom Components/BadTooltip',
  component: BadTooltip,
  args: {
    trigger: { render: <Button variant="outline" />, children: '查看帮助' },
    content: { role: 'tooltip', children: '在文档中查看组件属性和示例。', side: 'top' },
    disabled: false,
    onOpenChange: fn(),
  },
  argTypes: {
    trigger: { control: false, description: '触发器配置，render 可复用 Button，delay 设置悬停延迟。' },
    content: { control: 'object', description: '提示内容和定位参数，如 children、side、sideOffset、className。' },
    disabled: { control: 'boolean', description: '禁用提示功能，不会禁用触发按钮自身。' },
    open: { control: false, description: '受控开关状态，需配合 onOpenChange 更新。' },
    onOpenChange: { control: false },
  },
  render: (args) => <InteractiveExample key={String(args.content.children)} {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl min-w-0 p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip 的快捷组合封装，支持内容、定位和触发器配置，默认零延迟。每个实例内置独立 Provider，不共享跨提示的延迟组。样式支持字符串或状态函数，默认保留长文本换行。',
      },
    },
  },
} satisfies Meta<typeof BadTooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Tooltip vs BadTooltip',
  render: () => <ComparisonExample />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    for (const name of ['原始 Tooltip', 'BadTooltip']) {
      const trigger = canvas.getByRole('button', { name });
      await userEvent.hover(trigger);
      const popup = await body.findByRole('tooltip');
      await expect(popup).toHaveTextContent('VeryLongKeywordWithoutSpaces');
      if (name === 'BadTooltip') await expect(popup).toHaveClass('break-all');
      await userEvent.unhover(trigger);
      await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
    }
  },
};
export const Playground: Story = {
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const text = canvas.getByRole('textbox', { name: '提示内容' });
    await userEvent.clear(text);
    await userEvent.type(text, '修改后的说明');
    const trigger = canvas.getByRole('button', { name: '查看帮助' });
    await userEvent.hover(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('tooltip')).toHaveTextContent('修改后的说明');
    await expect(args.onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};
export const Positions: Story = {
  render: (args) => (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        分别悬停各按钮查看方位；靠近视口边缘时，底层会自动调整位置以避免溢出。
      </p>
      <div className="flex flex-wrap gap-4">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <BadTooltip
            {...args}
            key={side}
            trigger={{ ...args.trigger, children: side }}
            content={{ ...args.content, side, children: `${side} 方向的提示` }}
          />
        ))}
      </div>
    </div>
  ),
};
export const LongContent: Story = {
  args: {
    content: {
      role: 'tooltip',
      children:
        'https://example.com/VeryLongKeywordWithoutSpacesVeryLongKeywordWithoutSpacesVeryLongKeywordWithoutSpaces',
      className: 'max-w-48',
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '查看帮助' });
    await userEvent.hover(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('tooltip');
    await expect(popup).toHaveClass('max-w-48', 'break-all');
    await expect(popup.scrollWidth).toBeLessThanOrEqual(popup.clientWidth + 1);
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};
export const Delayed: Story = {
  args: { trigger: { render: <Button variant="outline" />, children: '查看帮助', delay: 600 } },
  parameters: {
    docs: { description: { story: '通过 trigger.delay 设置 600ms 悬停延迟。键盘聚焦仍会立即显示，保持键盘可用性。' } },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '查看帮助' });
    await userEvent.hover(trigger);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
    await waitFor(() => expect(body.getByRole('tooltip')).toBeVisible(), { timeout: 2000 });
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};
export const KeyboardFocus: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    canvas.getByRole('button', { name: '查看帮助' }).focus();
    // Portal 挂载早于入场动画完成，等待提示实际可见后再继续键盘操作。
    await waitFor(() => expect(body.getByRole('tooltip')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};
export const FunctionClassName: Story = {
  args: {
    content: {
      role: 'tooltip',
      children: '按打开状态设置内容宽度，并保留默认换行样式。',
      className: (state) => (state.open ? 'max-w-48' : 'max-w-xs'),
    },
  },
  parameters: {
    docs: { description: { story: '函数式 className 接收 Base UI 状态；仅追加布局样式，默认 Tooltip 外观仍保留。' } },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '查看帮助' });
    await userEvent.hover(trigger);
    await expect(await body.findByRole('tooltip')).toHaveClass('max-w-48', 'break-all', 'bg-foreground');
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
  },
};
function ControlledExample(args: BadTooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <BadTooltip
        {...args}
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next);
          args.onOpenChange?.(next, details);
        }}
      />
      <p className="text-sm">受控状态：{open ? '打开' : '关闭'}</p>
      <Button variant="outline" disabled={!open} onClick={() => setOpen(false)}>
        外部关闭
      </Button>
    </div>
  );
}
export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: '查看帮助' });
    trigger.focus();
    // Portal 挂载早于入场动画完成，等待提示实际可见后再继续键盘操作。
    await waitFor(() => expect(body.getByRole('tooltip')).toBeVisible());
    await expect(canvas.getByText('受控状态：打开')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
    await expect(canvas.getByText('受控状态：关闭')).toBeVisible();
  },
};
