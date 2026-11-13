import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from './context-menu';
function Example({ advanced = false, disabled = false }) {
  const [action, setAction] = useState('无');
  const [checked, setChecked] = useState(true);
  const [view, setView] = useState('list');
  return (
    <div className="flex flex-col gap-4">
      <ContextMenu disabled={disabled}>
        <ContextMenuTrigger
          className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed"
          aria-label="文件操作区域"
        >
          在此处右键打开菜单
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>文件操作</ContextMenuLabel>
            <ContextMenuItem onClick={() => setAction('复制')}>
              复制<ContextMenuShortcut>⌘C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem disabled>粘贴（不可用）</ContextMenuItem>
            <ContextMenuItem variant="destructive" onClick={() => setAction('删除示例')}>
              删除示例
            </ContextMenuItem>
          </ContextMenuGroup>
          {advanced && (
            <>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
                  显示详情
                </ContextMenuCheckboxItem>
              </ContextMenuGroup>
              <ContextMenuRadioGroup value={view} onValueChange={setView}>
                <ContextMenuRadioItem value="list">列表视图</ContextMenuRadioItem>
                <ContextMenuRadioItem value="grid">网格视图</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
              <ContextMenuSub>
                <ContextMenuSubTrigger>更多操作</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuGroup>
                    <ContextMenuItem onClick={() => setAction('导出')}>导出</ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      <p role="status">
        最近操作：{action}；详情：{checked ? '显示' : '隐藏'}；视图：{view}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/ContextMenu',
  component: Example,
  args: { advanced: false, disabled: false },
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
          '右键触发的上下文菜单。支持分组、禁用、危险操作、复选、单选及子菜单。示例只更新状态，不执行真实删除；快捷键提示不会注册快捷键。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.pointer({ target: canvas.getByLabelText('文件操作区域'), keys: '[MouseRight]' });
    const item = await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: /复制/ });
    await userEvent.click(item);
    await expect(canvas.getByRole('status')).toHaveTextContent('最近操作：复制');
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('menu')).not.toBeInTheDocument());
  },
};
export const Advanced: Story = {
  args: { advanced: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.pointer({ target: canvas.getByLabelText('文件操作区域'), keys: '[MouseRight]' });
    const item = await within(canvasElement.ownerDocument.body).findByRole('menuitemcheckbox', { name: '显示详情' });
    await userEvent.click(item);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('menu')).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('详情：隐藏');
  },
};
export const Disabled: Story = { args: { disabled: true } };
