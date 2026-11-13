import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { DirectionProvider, useDirection } from './direction';
import { Button } from './button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './breadcrumb';
function Preview() {
  const direction = useDirection();
  return (
    <div className="flex flex-col gap-3">
      <p role="status">当前方向：{direction}</p>
      <Breadcrumb aria-label={`页面路径（${direction}）`}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Components</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-2">
        <Button variant="outline">First</Button>
        <Button>Second</Button>
      </div>
    </div>
  );
}
function Example({ direction = 'ltr', nested = false }: { direction?: 'ltr' | 'rtl'; nested?: boolean }) {
  return (
    <DirectionProvider direction={direction}>
      <div dir={direction} className="flex flex-col gap-6">
        <Preview />
        {nested && (
          <DirectionProvider direction="ltr">
            <div dir="ltr" className="border-t pt-4">
              <p>嵌套区域固定为 LTR</p>
              <Preview />
            </div>
          </DirectionProvider>
        )}
      </div>
    </DirectionProvider>
  );
}
function Switchable() {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" onClick={() => setDirection((value) => (value === 'ltr' ? 'rtl' : 'ltr'))}>
        切换方向
      </Button>
      <Example direction={direction} />
    </div>
  );
}
const meta = {
  title: 'Components/Direction',
  component: Example,
  args: { direction: 'ltr', nested: false },
  argTypes: { direction: { control: 'radio', options: ['ltr', 'rtl'] } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'DirectionProvider 为 Base UI 提供方向上下文，dir 属性控制 DOM 排版，两者需保持一致。方向不会翻译内容；嵌套 Provider 可覆盖局部方向。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const RightToLeft: Story = { args: { direction: 'rtl' } };
export const Nested: Story = { args: { direction: 'rtl', nested: true } };
export const SwitchableDirection: Story = {
  render: () => <Switchable />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '切换方向' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('当前方向：rtl');
  },
};
