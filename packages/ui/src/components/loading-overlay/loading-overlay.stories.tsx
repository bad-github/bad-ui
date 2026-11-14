import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../../.storybook/testing/interaction-mode';
import { Button } from '../button';
import { Field, FieldLabel } from '../field';
import { Input } from '../input';
import { Loading, LoadingOverlay } from './index';

function Content() {
  const id = useId();
  return (
    <div className="flex flex-col gap-4 p-6">
      <Field>
        <FieldLabel htmlFor={id}>项目名称</FieldLabel>
        <Input id={id} defaultValue="组件库" />
      </Field>
      <Button>保存项目</Button>
    </div>
  );
}

const meta = {
  title: 'Components/LoadingOverlay',
  component: LoadingOverlay,
  args: {
    loading: true,
    type: 'area',
    size: 'default',
    text: '正在加载…',
    showText: true,
    children: <Content />,
  },
  argTypes: {
    loading: { control: 'boolean', description: '显示遮罩，同时禁用内容区域的鼠标和键盘交互。' },
    type: {
      control: 'select',
      options: ['area', 'component', 'page'],
      description: '加载动画样式，不改变遮罩定位范围。',
    },
    size: { control: 'select', options: ['xs', 'sm', 'default'], description: '加载指示器尺寸。' },
    text: { control: 'text', description: '加载提示，支持 ReactNode。' },
    showText: { control: 'boolean', description: '是否显示提示文字。' },
    children: { control: false },
    style: { control: false },
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
          '覆盖内容区域的加载遮罩。加载时通过 inert 禁用内容的点击与键盘聚焦，子组件保持挂载；加载提示位于禁用区域之外。type 仅选择动画，page 不代表全屏遮罩。Loading 可单独用于非阻塞加载提示。',
      },
    },
  },
} satisfies Meta<typeof LoadingOverlay>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Idle: Story = { args: { loading: false } };
export const WithoutText: Story = { args: { showText: false } };
export const CustomText: Story = {
  args: { text: <span>正在同步，请稍候…</span> },
};

export const AnimationTypes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['area', 'component', 'page'] as const).map((type) => (
        <section key={type} className="flex flex-col gap-2" aria-label={`${type} 动画`}>
          <h3 className="text-sm font-medium">{type}</h3>
          <LoadingOverlay {...args} type={type} />
        </section>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['area', 'component', 'page'] as const).map((type) => (
        <section key={type} className="flex flex-col gap-4" aria-label={`${type} 尺寸`}>
          <h3 className="text-sm font-medium">{type}</h3>
          <div className="flex flex-wrap items-center gap-6">
            {(['xs', 'sm', 'default'] as const).map((size) => (
              <Loading key={size} type={type} size={size} text={size} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

function InteractiveExample(args: React.ComponentProps<typeof LoadingOverlay>) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      {/* 切换按钮留在遮罩外，加载时仍可手动结束，避免示例依赖定时器。 */}
      <Button variant="outline" onClick={() => setLoading((value) => !value)}>
        {loading ? '结束加载' : '开始加载'}
      </Button>
      <LoadingOverlay {...args} loading={loading} />
    </div>
  );
}

export const Interactive: Story = {
  render: (args) => <InteractiveExample {...args} />,
  parameters: {
    docs: { description: { story: '先修改项目名称，再切换加载状态：加载期间内容不可聚焦，结束后输入值保留。' } },
  },
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('textbox', { name: '项目名称' });
    await userEvent.clear(input);
    await userEvent.type(input, '自定义组件');

    await step('加载时禁用内容，外部按钮仍可操作', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '开始加载' }));
      // 使用浏览器实际聚焦行为验证 inert，不能仅检查属性是否存在。
      input.focus();
      await expect(input).not.toHaveFocus();
      const saveButton = canvas.getByRole('button', { name: '保存项目' });
      saveButton.focus();
      await expect(saveButton).not.toHaveFocus();
      await expect(input.closest('[inert]')).toHaveAttribute('aria-busy', 'true');
      await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible();
    });

    await step('结束后恢复交互，保留原有输入', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '结束加载' }));
      await expect(input).toHaveValue('自定义组件');
      input.focus();
      await expect(input).toHaveFocus();
      await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    });
  },
};
