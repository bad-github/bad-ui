import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarLabel,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from './menubar';

function Example({
  mode = 'default',
  disabled = false,
}: {
  mode?: 'default' | 'checkbox' | 'radio' | 'submenu';
  disabled?: boolean;
}) {
  const [action, setAction] = useState('无');
  const [toolbar, setToolbar] = useState(true);
  const [view, setView] = useState('list');
  return (
    <div className="flex flex-col items-start gap-4">
      <Menubar aria-label="文档菜单">
        <MenubarMenu>
          <MenubarTrigger disabled={disabled}>文件</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarLabel>文档操作</MenubarLabel>
              <MenubarItem onClick={() => setAction('新建文档')}>
                新建文档<MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem disabled>打印（不可用）</MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarItem variant="destructive" onClick={() => setAction('模拟关闭')}>
                关闭示例
              </MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>编辑</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem onClick={() => setAction('模拟复制')}>复制示例</MenubarItem>
              <MenubarItem onClick={() => setAction('模拟粘贴')}>粘贴示例</MenubarItem>
            </MenubarGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>视图</MenubarTrigger>
          <MenubarContent>
            {mode === 'checkbox' ? (
              <MenubarGroup>
                <MenubarLabel>显示选项</MenubarLabel>
                <MenubarCheckboxItem checked={toolbar} onCheckedChange={setToolbar}>
                  显示工具栏
                </MenubarCheckboxItem>
              </MenubarGroup>
            ) : mode === 'radio' ? (
              <MenubarRadioGroup value={view} onValueChange={setView}>
                <MenubarLabel>布局</MenubarLabel>
                <MenubarRadioItem value="list">列表</MenubarRadioItem>
                <MenubarRadioItem value="grid">网格</MenubarRadioItem>
              </MenubarRadioGroup>
            ) : mode === 'submenu' ? (
              <MenubarGroup>
                <MenubarSub>
                  <MenubarSubTrigger>导出格式</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarGroup>
                      <MenubarItem onClick={() => setAction('导出 JSON')}>JSON</MenubarItem>
                      <MenubarItem onClick={() => setAction('导出 CSV')}>CSV</MenubarItem>
                    </MenubarGroup>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarGroup>
            ) : (
              <MenubarGroup>
                <MenubarItem onClick={() => setAction('重置缩放')}>重置缩放</MenubarItem>
              </MenubarGroup>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p role="status" className="text-sm">
        操作：{action}；工具栏：{toolbar ? '显示' : '隐藏'}；布局：{view === 'list' ? '列表' : '网格'}
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/Menubar',
  component: Example,
  args: { mode: 'default', disabled: false },
  argTypes: { mode: { control: 'select', options: ['default', 'checkbox', 'radio', 'submenu'] } },
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
          '桌面应用式菜单栏，支持方向键导航、复选、单选、子菜单和禁用项。操作只更新示例状态；不操作文件或剪贴板。快捷键文字只作提示，不注册键盘快捷键。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('文件'));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('menuitem', { name: '打印（不可用）' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await userEvent.click(body.getByRole('menuitem', { name: /新建文档/ }));
    await expect(canvas.getByRole('status')).toHaveTextContent('操作：新建文档');
    await waitFor(() => expect(body.queryAllByRole('menu', { hidden: true })).toHaveLength(0));
  },
};
export const CheckboxItems: Story = {
  args: { mode: 'checkbox' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('视图'));
    const item = await within(canvasElement.ownerDocument.body).findByRole('menuitemcheckbox', { name: '显示工具栏' });
    await expect(item).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(item);
    await expect(canvas.getByRole('status')).toHaveTextContent('工具栏：隐藏');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).queryAllByRole('menu', { hidden: true })).toHaveLength(0)
    );
  },
};
export const RadioItems: Story = {
  args: { mode: 'radio' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByText('视图'));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('menuitemradio', { name: '网格' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('布局：网格');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).queryAllByRole('menu', { hidden: true })).toHaveLength(0)
    );
  },
};
export const Submenu: Story = {
  args: { mode: 'submenu' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByText('视图'));
    (await body.findByRole('menuitem', { name: '导出格式' })).focus();
    await userEvent.keyboard('{ArrowRight}');
    const item = await body.findByRole('menuitem', { name: 'JSON' });
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('操作：导出 JSON');
    await waitFor(() => expect(body.queryAllByRole('menu', { hidden: true })).toHaveLength(0));
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const KeyboardNavigation: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByText('文件');
    trigger.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    const item = await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: '复制示例' });
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('操作：模拟复制');
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).queryAllByRole('menu', { hidden: true })).toHaveLength(0)
    );
  },
};
