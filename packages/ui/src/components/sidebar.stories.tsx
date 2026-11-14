import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { HomeIcon, BookOpenIcon, SettingsIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from './sidebar';
function Example({
  collapsible = 'icon',
  variant = 'sidebar',
  side = 'left',
  submenu = false,
}: {
  collapsible?: 'icon' | 'offcanvas' | 'none';
  variant?: 'sidebar' | 'floating' | 'inset';
  side?: 'left' | 'right';
  submenu?: boolean;
}) {
  const [selected, setSelected] = useState('概览');
  return (
    <SidebarProvider className="h-full min-h-0">
      <Sidebar side={side} variant={variant} collapsible={collapsible}>
        <SidebarHeader>
          <p className="truncate px-2 text-sm font-medium">bad-ui 文档</p>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>工作区</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { text: '概览', Icon: HomeIcon },
                  { text: '组件', Icon: BookOpenIcon },
                  { text: '设置', Icon: SettingsIcon },
                ].map(({ text, Icon }) => (
                  <SidebarMenuItem key={text}>
                    <SidebarMenuButton aria-label={text} isActive={selected === text} onClick={() => setSelected(text)}>
                      <Icon aria-hidden="true" />
                      <span>{text}</span>
                    </SidebarMenuButton>
                    {text === '组件' && <SidebarMenuBadge>12</SidebarMenuBadge>}
                    {submenu && text === '组件' && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<button type="button" />}
                            onClick={() => setSelected('基础组件')}
                          >
                            基础组件
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="truncate px-2 text-xs">组件库演示</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="flex items-center gap-2 border-b p-3">
          {collapsible !== 'none' && <SidebarTrigger aria-label="切换侧栏" />}
          <span className="text-sm">工作区</span>
        </header>
        <div className="flex flex-col gap-3 p-4">
          <h2 className="font-medium">{selected}</h2>
          <p role="status" className="text-sm">
            当前页面：{selected}
          </p>
          <p className="text-sm text-muted-foreground">点击侧栏切换示例页面；折叠状态由 Provider 管理。</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
const meta = {
  title: 'Components/Sidebar',
  component: Example,
  args: { collapsible: 'icon', variant: 'sidebar', side: 'left', submenu: false },
  argTypes: {
    collapsible: { control: 'select', options: ['icon', 'offcanvas', 'none'] },
    variant: { control: 'select', options: ['sidebar', 'floating', 'inset'] },
    side: { control: 'select', options: ['left', 'right'] },
  },
  decorators: [
    (Story) => (
      <div className="relative isolate h-[480px] w-full [transform:translateZ(0)] overflow-hidden rounded-lg border [&_[data-slot=sidebar-container]]:h-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '完整侧栏布局，组合 Provider、Sidebar、Inset 和菜单组件。支持图标折叠、移出画布、固定侧栏、左右位置与嵌套菜单。移动端自动转为 Sheet；在窄屏下先点击触发器打开。示例只切换本地内容。',
      },
      story: { height: 560 },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '组件' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('当前页面：组件');
    await userEvent.click(canvas.getByRole('button', { name: '切换侧栏' }));
  },
};
export const Offcanvas: Story = { args: { collapsible: 'offcanvas' } };
export const Fixed: Story = { args: { collapsible: 'none' } };
export const Floating: Story = { args: { variant: 'floating' } };
export const Inset: Story = { args: { variant: 'inset' } };
export const Right: Story = { args: { side: 'right' } };
export const Submenu: Story = { args: { submenu: true } };
