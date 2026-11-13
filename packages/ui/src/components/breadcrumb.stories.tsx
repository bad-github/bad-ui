import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SlashIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';

function CollapsedExample() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Breadcrumb aria-label="折叠路径">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">首页</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {expanded ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href="#docs">文档</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#components">组件</BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <button
              type="button"
              aria-label="展开中间路径"
              aria-expanded={expanded}
              onClick={() => setExpanded(true)}
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BreadcrumbEllipsis />
            </button>
          </BreadcrumbItem>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  subcomponents: {
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '层级导航。链接与当前页面分别使用 BreadcrumbLink、BreadcrumbPage；当前页标记 aria-current="page"。省略号只是装饰，展开行为由调用方实现。示例锚点仅作演示。',
      },
    },
  },
  render: (args) => (
    <Breadcrumb {...args} aria-label="页面路径">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">首页</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#components">组件</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('navigation', { name: '页面路径' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Breadcrumb' })).toHaveAttribute('aria-current', 'page');
  },
};
export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#docs">文档</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <SlashIcon aria-hidden="true" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>安装指南</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
export const CurrentPageOnly: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>首页</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
export const Collapsed: Story = {
  render: () => <CollapsedExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '展开中间路径' }));
    await expect(canvas.getByRole('link', { name: '文档' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: '组件' })).toBeVisible();
  },
};
export const LongPath: Story = {
  render: () => (
    <div className="max-w-72">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#workspace">工作空间</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#guides">组件库接入与主题配置指南</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>生产环境的发布与升级说明</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
};
