import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
  useComboboxAnchor,
} from './combobox';
const items = ['React', 'Vue', 'Svelte', 'Angular'];
function Example({ disabled = false, clear = false }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <Combobox items={items} value={value} onValueChange={setValue} disabled={disabled}>
        <ComboboxInput aria-label="选择框架" placeholder="搜索框架" showClear={clear} />
        <ComboboxContent>
          <ComboboxEmpty>没有匹配的框架</ComboboxEmpty>
          <ComboboxList aria-label="框架选项">
            {(item: string) => (
              <ComboboxGroup key={item}>
                <ComboboxItem value={item}>{item}</ComboboxItem>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p role="status">当前：{value ?? '未选择'}</p>
    </div>
  );
}
function Multi() {
  const anchor = useComboboxAnchor();
  const [value, setValue] = useState<string[]>(['React']);
  return (
    <Combobox multiple items={items} value={value} onValueChange={setValue}>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((item) => (
                <ComboboxChip key={item} aria-label={item} showRemove={false}>
                  {item}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput aria-label="添加框架" placeholder="搜索并添加" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>没有匹配项</ComboboxEmpty>
        <ComboboxList aria-label="框架选项">
          {(item: string) => (
            <ComboboxGroup key={item}>
              <ComboboxItem value={item}>{item}</ComboboxItem>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
const meta = {
  title: 'Components/Combobox',
  component: Example,
  args: { disabled: false, clear: false },
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
          '可搜索选择器，支持受控单选、多选和清除。列表内容由 items 与渲染函数生成，弹层通过 Portal 展示；可输入筛选或通过方向键与 Enter 选择。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const input = canvas.getByRole('combobox', { name: '选择框架' });
    await userEvent.type(input, 'React');
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('option', { name: 'React' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('当前：React');
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const Clearable: Story = { args: { clear: true } };
export const Multiple: Story = { render: () => <Multi /> };
export const EmptySearch: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.type(canvas.getByRole('combobox', { name: '选择框架' }), '不存在');
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).getByText('没有匹配的框架')).toBeVisible(), {
      timeout: 10000,
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(canvasElement.ownerDocument.body).queryByRole('listbox')).not.toBeInTheDocument()
    );
  },
};
