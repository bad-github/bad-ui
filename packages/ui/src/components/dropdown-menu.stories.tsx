import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu';
import { Button } from './button';
function Example({
  advanced = false,
  disabled = false,
  align = 'start',
}: {
  advanced?: boolean;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
}) {
  const [selected, setSelected] = useState('无');
  const [checked, setChecked] = useState(true);
  const [view, setView] = useState('list');
  return (
    <div className="flex flex-col gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger disabled={disabled} render={<Button variant="outline" />}>
          打开操作菜单
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>项目操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSelected('复制链接')}>
              复制链接<DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>归档（不可用）</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setSelected('模拟删除')}>
              删除示例
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {advanced && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
                  显示详情
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <DropdownMenuRadioGroup value={view} onValueChange={setView}>
                <DropdownMenuRadioItem value="list">列表</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="grid">网格</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>导出格式</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setSelected('JSON')}>JSON</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelected('CSV')}>CSV</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <p role="status">
        操作：{selected}；详情：{checked ? '显示' : '隐藏'}；视图：{view}
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/DropdownMenu',
  component: Example,
  args: { advanced: false, disabled: false, align: 'start' },
  argTypes: { align: { control: 'select', options: ['start', 'center', 'end'] } },
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
          '按钮触发菜单，支持分组、快捷键提示、禁用、危险项、复选、单选和子菜单。示例只更新状态，不访问剪贴板或删除真实内容。快捷键文字不会自动注册快捷键。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '打开操作菜单' }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('menuitem', { name: /复制链接/ }));
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('操作：复制链接');
  },
};
export const Advanced: Story = {
  args: { advanced: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '打开操作菜单' }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('menuitemradio', { name: '网格' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    await expect(canvas.getByRole('status')).toHaveTextContent('视图：grid');
  },
};
export const EndAligned: Story = { args: { align: 'end' } };
export const DisabledTrigger: Story = { args: { disabled: true } };
export const Keyboard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: '打开操作菜单' });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('menu')).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
