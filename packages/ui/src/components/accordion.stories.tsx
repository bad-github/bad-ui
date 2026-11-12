import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { expect, fn } from 'storybook/test';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Button } from './button';

const items = [
  { value: 'appearance', title: '如何调整外观？', content: '通过预览工具栏切换浅色、深色和系统主题。' },
  { value: 'colors', title: '基础色和主题色有什么区别？', content: '基础色决定中性色调，主题色决定按钮等元素的主色。' },
  { value: 'radius', title: '圆角可以自定义吗？', content: '可以。圆角使用 rem 为单位，支持有限的非负数值。' },
];

function ExampleItems({ disabledItem = false }: { disabledItem?: boolean }) {
  return items.map((item, index) => (
    <AccordionItem key={item.value} value={item.value} disabled={disabledItem && index === 1}>
      <AccordionTrigger>{item.title}</AccordionTrigger>
      <AccordionContent>
        <p>{item.content}</p>
      </AccordionContent>
    </AccordionItem>
  ));
}

function ControlledExample(args: ComponentProps<typeof Accordion>) {
  const [value, setValue] = useState<string[]>(['appearance']);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setValue(['colors'])}>
          打开配色说明
        </Button>
        <Button variant="outline" onClick={() => setValue([])}>
          全部收起
        </Button>
      </div>
      <Accordion
        {...args}
        value={value}
        onValueChange={(next, details) => {
          setValue(next);
          args.onValueChange?.(next, details);
        }}
      >
        <ExampleItems />
      </Accordion>
      <p role="status" className="text-sm text-muted-foreground">
        展开项：{value.join(', ') || '无'}
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
  args: { multiple: false, disabled: false, onValueChange: fn() },
  argTypes: {
    multiple: { control: 'boolean', description: '允许同时展开多项，默认 false。' },
    disabled: { control: 'boolean', description: '禁用整组；单项禁用请在 AccordionItem 上设置 disabled。' },
    defaultValue: { control: 'object', description: '非受控初始展开项，使用 value 数组；挂载后修改不更新当前状态。' },
    value: { control: false, description: '受控展开项数组，需配合 onValueChange；见 Controlled。' },
    onValueChange: { control: false, description: '展开项变化时接收新的 value 数组和事件信息。' },
    children: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          '基于 Base UI 的折叠面板。组合 AccordionItem、AccordionTrigger 和 AccordionContent 使用。默认单项展开，也可收起所有项；使用数组管理展开值。键盘通过 Tab 切换标题，Enter / Space 展开或收起。',
      },
    },
  },
  render: (args) => (
    <Accordion {...args}>
      <ExampleItems />
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    const first = canvas.getByRole('button', { name: items[0].title });
    const second = canvas.getByRole('button', { name: items[1].title });
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(first);
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(items[0].content)).toBeVisible();
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['colors'], expect.anything());
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith([], expect.anything());
  },
};

export const DefaultOpen: Story = {
  args: { defaultValue: ['appearance'] },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('button', { name: items[0].title })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(items[0].content)).toBeVisible();
  },
};

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ['appearance'] },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: items[1].title }));
    for (const item of items.slice(0, 2)) {
      await expect(canvas.getByRole('button', { name: item.title })).toHaveAttribute('aria-expanded', 'true');
      await expect(canvas.getByText(item.content)).toBeVisible();
    }
  },
};

export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '打开配色说明' }));
    await expect(canvas.getByRole('button', { name: items[1].title })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('status')).toHaveTextContent('展开项：colors');
    await userEvent.click(canvas.getByRole('button', { name: items[2].title }));
    await expect(canvas.getByRole('status')).toHaveTextContent('展开项：radius');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(['radius'], expect.anything());
    await userEvent.click(canvas.getByRole('button', { name: '全部收起' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('展开项：无');
    await expect(canvas.getByRole('button', { name: items[2].title })).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, args }) => {
    if (!shouldRunInteractions) return;
    for (const item of items) {
      await expect(canvas.getByRole('button', { name: item.title })).toBeDisabled();
      await expect(canvas.getByRole('button', { name: item.title })).toHaveAttribute('aria-expanded', 'false');
    }
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledItem: Story = {
  render: (args) => (
    <Accordion {...args}>
      <ExampleItems disabledItem />
    </Accordion>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('button', { name: items[1].title })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: items[0].title }));
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: items[2].title })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText(items[2].content)).toBeVisible();
  },
};

export const Keyboard: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Tab 按 DOM 顺序移动焦点，Enter 和 Space 激活标题。当前 Base UI 版本不使用方向键循环焦点。',
      },
    },
  },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const first = canvas.getByRole('button', { name: items[0].title });
    await userEvent.click(first);
    await userEvent.keyboard(' ');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Enter}');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: items[1].title })).toHaveFocus();
  },
};
