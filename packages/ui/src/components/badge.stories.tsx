import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon, ArrowRightIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Badge } from './badge';

const variants = ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const;
const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: '已发布', variant: 'default' },
  argTypes: {
    variant: { control: 'select', options: variants },
    children: { control: 'text' },
    render: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="flex flex-wrap items-center gap-4 p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '用于状态、计数和分类标记，默认渲染 span。使用 render 可组合链接或按钮；link 变体只改变外观，不会自动提供链接语义。',
      },
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Variants: Story = {
  render: () => (
    <>
      {variants.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </>
  ),
};
export const WithIcons: Story = {
  render: () => (
    <>
      <Badge>
        <CheckIcon data-icon="inline-start" aria-hidden="true" />
        已完成
      </Badge>
      <Badge variant="outline">
        下一步
        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
      </Badge>
    </>
  ),
};
export const Counts: Story = {
  render: () => (
    <>
      <Badge>8</Badge>
      <Badge variant="secondary">99+</Badge>
      <Badge variant="outline">Beta</Badge>
    </>
  ),
};
export const Link: Story = {
  args: { render: <a href="https://github.com/bad-github/bad-ui" />, children: 'GitHub 仓库', variant: 'outline' },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('link', { name: 'GitHub 仓库' })).toHaveAttribute(
      'href',
      'https://github.com/bad-github/bad-ui'
    );
  },
};
const onActivate = fn();
export const Interactive: Story = {
  args: { render: <button type="button" onClick={onActivate} />, children: '查看状态' },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    onActivate.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: '查看状态' }));
    await userEvent.keyboard('{Enter}');
    await expect(onActivate).toHaveBeenCalledTimes(2);
  },
};
