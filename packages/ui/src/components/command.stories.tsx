import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from './command';
import { Button } from './button';
function Palette({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <Command label="搜索命令">
      <CommandInput placeholder="搜索命令" aria-label="搜索命令" />
      <CommandList>
        <CommandEmpty>
          <span role="option" aria-disabled="true">
            没有找到命令
          </span>
        </CommandEmpty>
        <CommandGroup heading="导航">
          <CommandItem onSelect={() => onSelect('首页')}>
            首页<CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => onSelect('设置')}>设置</CommandItem>
        </CommandGroup>
        <CommandSeparator aria-hidden="true" />
        <CommandGroup heading="操作">
          <CommandItem disabled>删除项目（不可用）</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
function Example({ dialog = false }) {
  const [selected, setSelected] = useState('无');
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      {dialog ? (
        <>
          <Button variant="outline" onClick={() => setOpen(true)}>
            打开命令菜单
          </Button>
          <CommandDialog open={open} onOpenChange={setOpen} title="项目命令" description="搜索并选择要执行的示例命令">
            <Palette
              onSelect={(value) => {
                setSelected(value);
                setOpen(false);
              }}
            />
          </CommandDialog>
        </>
      ) : (
        <Palette onSelect={setSelected} />
      )}
      <p role="status">已选择：{selected}</p>
    </div>
  );
}
const meta = {
  title: 'Components/Command',
  component: Example,
  args: { dialog: false },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '基于 cmdk 的命令筛选器。支持分组、禁用项、空结果和弹窗组合；快捷键文字仅作提示，不自动注册全局快捷键。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.type(canvas.getByRole('combobox', { name: '搜索命令' }), '设置');
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('已选择：设置');
  },
};
export const Empty: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.type(canvas.getByRole('combobox', { name: '搜索命令' }), '不存在');
    await expect(canvas.getByText('没有找到命令')).toBeVisible();
  },
};
export const Dialog: Story = {
  args: { dialog: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '打开命令菜单' }));
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog', { name: '项目命令' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      const popup = body.queryByRole('dialog', { hidden: true });
      expect(popup === null || popup.hasAttribute('data-closed')).toBe(true);
    });
  },
};
