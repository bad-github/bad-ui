import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { BookOpenIcon, PaletteIcon } from 'lucide-react';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from './navigation-menu';
import { Button } from './button';

function Example({
  icons = false,
  disabled = false,
  active = false,
  controlled = false,
  align = 'start',
}: {
  icons?: boolean;
  disabled?: boolean;
  active?: boolean;
  controlled?: boolean;
  align?: 'start' | 'center' | 'end';
}) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-start gap-4">
      {controlled && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setValue('docs')}>
            展开文档导航
          </Button>
          <Button size="sm" variant="outline" onClick={() => setValue(null)}>
            关闭导航
          </Button>
        </div>
      )}
      <NavigationMenu
        aria-label="组件库导航"
        align={align}
        value={controlled ? value : undefined}
        onValueChange={(next) => setValue(next as string | null)}
      >
        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger disabled={disabled}>文档</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-72 max-w-[calc(100vw-3rem)] gap-1">
                <NavigationMenuLink href="https://ui.shadcn.com/docs">
                  {icons && <BookOpenIcon aria-hidden="true" />}
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-medium">开始使用</span>
                    <span className="text-xs text-muted-foreground">安装组件并了解基础用法。</span>
                  </span>
                </NavigationMenuLink>
                <NavigationMenuLink href="https://ui.shadcn.com/docs/theming">
                  {icons && <PaletteIcon aria-hidden="true" />}
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-medium">主题配置</span>
                    <span className="text-xs text-muted-foreground">设置主题色、圆角与外观。</span>
                  </span>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="components">
            <NavigationMenuTrigger>组件</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex w-56 max-w-[calc(100vw-3rem)] flex-col gap-1">
                <NavigationMenuLink href="https://ui.shadcn.com/docs/components/base/button">Button</NavigationMenuLink>
                <NavigationMenuLink href="https://ui.shadcn.com/docs/components/base/input">Input</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="https://github.com/bad-github/bad-ui"
              active={active}
              aria-current={active ? 'page' : undefined}
            >
              项目仓库
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {controlled && (
        <p role="status" className="text-sm">
          {value === null ? '导航已关闭' : value === 'docs' ? '文档导航已展开' : '组件导航已展开'}
        </p>
      )}
    </div>
  );
}

const meta = {
  title: 'Components/NavigationMenu',
  component: Example,
  args: { icons: false, disabled: false, active: false, controlled: false, align: 'start' },
  argTypes: { align: { control: 'select', options: ['start', 'center', 'end'] } },
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
          '网站导航，由 List、Item、Trigger、Content 和 Link 组合。支持展开面板、禁用触发器、当前页面标识、方向键与受控开关；内置 Positioner 已负责弹层，无需重复添加。示例链接指向真实文档或仓库，点击后会导航。',
      },
      story: { height: 400 },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '文档' });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole('link', { name: /开始使用/ })).toBeVisible());
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('link', { name: /开始使用/ })).not.toBeInTheDocument());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
export const WithIcons: Story = { args: { icons: true } };
export const ActiveLink: Story = {
  args: { active: true },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('link', { name: '项目仓库' })).toHaveAttribute('aria-current', 'page');
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '文档' });
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
export const Controlled: Story = {
  args: { controlled: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '展开文档导航' }));
    await waitFor(() => expect(body.getByRole('link', { name: /开始使用/ })).toBeVisible());
    await expect(canvas.getByRole('status')).toHaveTextContent('文档导航已展开');
    await userEvent.click(canvas.getByRole('button', { name: '关闭导航' }));
    await waitFor(() => expect(body.queryByRole('link', { name: /开始使用/ })).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('导航已关闭');
  },
};
export const KeyboardNavigation: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '文档' });
    const body = within(canvasElement.ownerDocument.body);
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const link = await body.findByRole('link', { name: /开始使用/ });
    await waitFor(() => expect(link).toBeVisible());
    await userEvent.tab();
    await waitFor(() => expect(link).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('link', { name: /开始使用/ })).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
