import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FileTextIcon, ChevronRightIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { sampleImage } from '../../.storybook/testing/sample-image';
import {
  Item,
  ItemGroup,
  ItemSeparator,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemHeader,
  ItemFooter,
} from './item';
import { Button } from './button';
import { Badge } from './badge';
function Example({
  variant = 'default',
  size = 'default',
  media = 'icon',
  details = false,
}: {
  variant?: 'default' | 'outline' | 'muted';
  size?: 'default' | 'sm' | 'xs';
  media?: 'icon' | 'image' | 'none';
  details?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <Item variant={variant} size={size}>
      {details && (
        <ItemHeader>
          <Badge variant="secondary">文档</Badge>
          <span className="text-xs text-muted-foreground">示例项目</span>
        </ItemHeader>
      )}
      {media !== 'none' && (
        <ItemMedia variant={media}>
          {media === 'image' ? <img src={sampleImage} alt="UI 文档缩略图" /> : <FileTextIcon aria-hidden="true" />}
        </ItemMedia>
      )}
      <ItemContent className="min-w-0">
        <ItemTitle>组件使用指南</ItemTitle>
        <ItemDescription>了解组件的属性、主题配置和交互方式。</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline" onClick={() => setSaved((value) => !value)} aria-pressed={saved}>
          {saved ? '已收藏' : '收藏'}
        </Button>
      </ItemActions>
      {details && (
        <ItemFooter>
          <span className="text-xs text-muted-foreground">可从文档侧边栏查看完整示例。</span>
        </ItemFooter>
      )}
    </Item>
  );
}
function GroupExample() {
  return (
    <ItemGroup aria-label="项目文档">
      {['接入指南', '主题配置', '发布说明'].map((title, index) => (
        <div role="listitem" key={title}>
          <Item size="sm">
            <ItemMedia variant="icon">
              <FileTextIcon aria-hidden="true" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{title}</ItemTitle>
              <ItemDescription>查看相关文档与示例。</ItemDescription>
            </ItemContent>
          </Item>
          {index < 2 && <ItemSeparator aria-hidden="true" />}
        </div>
      ))}
    </ItemGroup>
  );
}
const meta = {
  title: 'Components/Item',
  component: Example,
  args: { variant: 'default', size: 'default', media: 'icon', details: false },
  argTypes: {
    variant: { control: 'select', options: ['default', 'outline', 'muted'] },
    size: { control: 'select', options: ['default', 'sm', 'xs'] },
    media: { control: 'select', options: ['icon', 'image', 'none'] },
  },
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
          '通用条目，组合媒体、标题、说明与操作，支持三种变体和尺寸。ItemGroup 提供 list 语义，调用方补充 listitem 包装。链接条目通过 render 组合，避免在链接内嵌套按钮。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const button = canvas.getByRole('button', { name: '收藏' });
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveTextContent('已收藏');
  },
};
export const Outline: Story = { args: { variant: 'outline' } };
export const Muted: Story = { args: { variant: 'muted' } };
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['default', 'sm', 'xs'] as const).map((size) => (
        <Example size={size} key={size} />
      ))}
    </div>
  ),
};
export const Image: Story = { args: { media: 'image' } };
export const WithHeaderAndFooter: Story = { args: { details: true, variant: 'outline' } };
export const Group: Story = {
  render: () => <GroupExample />,
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};
export const Link: Story = {
  render: () => (
    <Item render={<a href="https://github.com/bad-github/bad-ui" />} variant="outline">
      <ItemContent>
        <ItemTitle>GitHub 仓库</ItemTitle>
        <ItemDescription>浏览组件库源码。</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" aria-hidden="true" />
      </ItemActions>
    </Item>
  ),
};
