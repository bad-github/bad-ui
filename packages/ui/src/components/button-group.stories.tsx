import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { ButtonGroup, ButtonGroupText, ButtonGroupSeparator } from './button-group';
import { Button } from './button';
import { Input } from './input';

function QuantityExample() {
  const [quantity, setQuantity] = useState(1);
  return (
    <ButtonGroup aria-label="数量调整">
      <Button
        variant="outline"
        size="icon"
        aria-label="减少数量"
        disabled={quantity === 0}
        onClick={() => setQuantity((value) => Math.max(0, value - 1))}
      >
        <MinusIcon aria-hidden="true" />
      </Button>
      <ButtonGroupText>
        <output aria-label="当前数量" className="min-w-6 text-center tabular-nums">
          {quantity}
        </output>
      </ButtonGroupText>
      <Button variant="outline" size="icon" aria-label="增加数量" onClick={() => setQuantity((value) => value + 1)}>
        <PlusIcon aria-hidden="true" />
      </Button>
    </ButtonGroup>
  );
}
const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  subcomponents: { ButtonGroupText, ButtonGroupSeparator },
  args: { orientation: 'horizontal' },
  argTypes: { orientation: { control: 'radio', options: ['horizontal', 'vertical'] }, children: { control: false } },
  decorators: [
    (Story) => (
      <div className="flex flex-wrap items-start gap-6 p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '将相关按钮和文本、输入框组合，提供 group 语义。横向或纵向排列，每个按钮独立管理操作与禁用状态。分组不会自动提供互斥选择或方向键导航。',
      },
    },
  },
  render: (args) => (
    <ButtonGroup {...args} aria-label="历史操作">
      <Button variant="outline">撤销</Button>
      <Button variant="outline">重做</Button>
      <Button variant="outline">历史记录</Button>
    </ButtonGroup>
  ),
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
export const Sizes: Story = {
  render: () => (
    <>
      {(['xs', 'sm', 'default', 'lg'] as const).map((size) => (
        <ButtonGroup key={size} aria-label={`${size} 按钮组`}>
          <Button variant="outline" size={size}>
            撤销
          </Button>
          <Button variant="outline" size={size}>
            重做
          </Button>
        </ButtonGroup>
      ))}
    </>
  ),
};
export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup aria-label="文件操作">
      <Button>保存</Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="添加文件">
        <PlusIcon aria-hidden="true" />
      </Button>
    </ButtonGroup>
  ),
};
export const WithInput: Story = {
  render: () => (
    <ButtonGroup aria-label="网站地址" className="w-full max-w-sm">
      <ButtonGroupText render={<label htmlFor="group-domain" />}>https://</ButtonGroupText>
      <Input id="group-domain" aria-label="域名" placeholder="example.com" />
      <Button variant="outline">检查</Button>
    </ButtonGroup>
  ),
};
export const Disabled: Story = {
  render: () => (
    <ButtonGroup aria-label="禁用操作">
      <Button variant="outline">可用操作</Button>
      <Button variant="outline" disabled>
        不可用操作
      </Button>
      <Button variant="outline">下一项</Button>
    </ButtonGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('button', { name: '不可用操作' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: '可用操作' }));
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: '下一项' })).toHaveFocus();
  },
};
export const Quantity: Story = {
  render: () => <QuantityExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '增加数量' }));
    await expect(canvas.getByLabelText('当前数量')).toHaveTextContent('2');
    await userEvent.click(canvas.getByRole('button', { name: '减少数量' }));
    await userEvent.click(canvas.getByRole('button', { name: '减少数量' }));
    await expect(canvas.getByLabelText('当前数量')).toHaveTextContent('0');
    await expect(canvas.getByRole('button', { name: '减少数量' })).toBeDisabled();
  },
};
