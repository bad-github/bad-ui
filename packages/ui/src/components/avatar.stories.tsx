import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { CheckIcon } from 'lucide-react';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { sampleImage } from '../../.storybook/testing/sample-image';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from './avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  subcomponents: { AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount },
  args: { size: 'default' },
  argTypes: { size: { control: 'select', options: ['sm', 'default', 'lg'] }, children: { control: false } },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '用户头像，图片加载失败时展示 AvatarFallback。提供 sm、default、lg 三种尺寸，可组合状态标记和重叠头像组。示例使用内嵌图片，无需联网。',
      },
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={sampleImage} alt="UI 示例头像" />
      <AvatarFallback>UI</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    const image = await canvas.findByRole('img', { name: 'UI 示例头像' });
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
  },
};
export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args} aria-label="张三">
      <AvatarFallback>张</AvatarFallback>
    </Avatar>
  ),
};
export const BrokenImage: Story = {
  render: (args) => (
    <Avatar {...args} aria-label="头像加载失败示例">
      <AvatarImage src="data:image/png;base64,broken" alt="示例头像" />
      <AvatarFallback>UI</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(await canvas.findByText('UI')).toBeVisible();
    await expect(canvas.queryByRole('img', { name: '示例头像' })).not.toBeInTheDocument();
  },
};
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <figure key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarImage src={sampleImage} alt={`${size} 示例头像`} />
            <AvatarFallback>UI</AvatarFallback>
          </Avatar>
          <figcaption className="text-sm text-muted-foreground">{size}</figcaption>
        </figure>
      ))}
    </div>
  ),
};
export const WithBadge: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Avatar size={size} key={size}>
          <AvatarImage src={sampleImage} alt={`${size} 已验证用户`} />
          <AvatarFallback>UI</AvatarFallback>
          <AvatarBadge role="img" aria-label="已验证">
            <CheckIcon aria-hidden="true" />
          </AvatarBadge>
        </Avatar>
      ))}
    </div>
  ),
};
export const Group: Story = {
  render: (args) => (
    <AvatarGroup aria-label="项目成员">
      {['张', '李', '王'].map((name) => (
        <Avatar {...args} key={name} aria-label={`${name}姓成员`}>
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount aria-label="另外 5 位成员">+5</AvatarGroupCount>
    </AvatarGroup>
  ),
};
export const GroupSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <AvatarGroup key={size} aria-label={`${size} 成员组`}>
          {['张', '李'].map((name) => (
            <Avatar key={name} size={size} aria-label={`${name}姓成员`}>
              <AvatarFallback>{name}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount aria-label="另外 3 位成员">+3</AvatarGroupCount>
        </AvatarGroup>
      ))}
    </div>
  ),
};
