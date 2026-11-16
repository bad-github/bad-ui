import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useRef, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import { shouldRunInteractions } from '../../../.storybook/testing/interaction-mode';
import { ConfigProvider, enUS, zhCN } from './index';
import { BadPagination } from '../../components/bad-pagination';
import { BadInput } from '../../components/bad-input';
import { BadButton } from '../../components/bad-button';
import { BadEmpty } from '../../components/bad-empty';
import { BadDialogContent } from '../../components/bad-dialog-content';
import { BadTooltip } from '../../components/bad-tooltip';
import { InputPopover } from '../../components/input-popover';
import { Button } from '../../components/button';
import { Dialog, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from '../../components/dialog';
import { NativeSelect, NativeSelectOption } from '../../components/native-select';
import { Field, FieldLabel } from '../../components/field';
import { Switch } from '../../components/switch';
import { Loading } from '../../components/loading-overlay';
import { TiktokLoading } from '../../components/tiktok-loading';

function LiveExample() {
  const id = useId();
  const [language, setLanguage] = useState('zh');
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <Field className="w-auto">
          <FieldLabel htmlFor={`${id}-lang`}>语言</FieldLabel>
          <NativeSelect id={`${id}-lang`} value={language} onChange={(event) => setLanguage(event.currentTarget.value)}>
            <NativeSelectOption value="zh">简体中文</NativeSelectOption>
            <NativeSelectOption value="en">English</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field orientation="horizontal" className="w-auto">
          <Switch id={`${id}-disabled`} checked={disabled} onCheckedChange={setDisabled} />
          <FieldLabel htmlFor={`${id}-disabled`}>禁用自定义组件</FieldLabel>
        </Field>
      </div>
      <ConfigProvider
        locale={language === 'zh' ? zhCN : enUS}
        disabled={disabled}
        pagination={{ showTotal: true, showSizeChanger: true, showQuickJumper: true, pageSizeOptions: [10, 25, 50] }}
      >
        <Field>
          <FieldLabel htmlFor={`${id}-input`}>自定义输入框</FieldLabel>
          <BadInput id={`${id}-input`} allowClear defaultValue="示例内容" />
        </Field>
        <div className="flex flex-wrap gap-3">
          <BadButton>自定义按钮</BadButton>
          <Button>基础 Button</Button>
        </div>
        <BadPagination total={96} />
        <BadEmpty />
      </ConfigProvider>
    </div>
  );
}
const meta = {
  title: 'Providers/ConfigProvider',
  component: ConfigProvider,
  args: { children: null },
  parameters: {
    docs: {
      description: {
        component:
          '可选的组件默认配置。优先级：组件 props → 最近一层 Provider → 内置默认。嵌套 Provider 按组件和词条继承；false 与 null 是有效覆盖。仅自定义组件主动读取，原始 shadcn 不受影响。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl min-w-0 self-start p-6">
        <Story />
      </div>
    ),
  ],
  render: () => <LiveExample />,
} satisfies Meta<typeof ConfigProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('button', { name: '清空输入' })).toBeVisible();
    await expect(canvas.getByText('共 96 条')).toBeVisible();
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '语言' }), 'en');
    await expect(canvas.getByRole('button', { name: 'Clear input' })).toBeVisible();
    await expect(canvas.getByText('96 items')).toBeVisible();
    await expect(canvas.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
    await userEvent.click(canvas.getByRole('switch', { name: '禁用自定义组件' }));
    await expect(canvas.getByRole('button', { name: '自定义按钮' })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: '自定义输入框' })).toBeDisabled();
    await expect(canvas.getByRole('combobox', { name: 'Page size' })).toBeDisabled();
    // 基础组件没有读取此 Context，Provider 不应隐式改变原始 Button。
    await expect(canvas.getByRole('button', { name: '基础 Button' })).toBeEnabled();
  },
};

export const NestedAndOverrides: Story = {
  render: () => (
    <ConfigProvider
      locale={enUS}
      disabled
      pagination={{ pageSizeOptions: [10, 25], showSizeChanger: true, showTotal: true }}
    >
      <div className="flex flex-col gap-6">
        <BadButton>继承外层禁用</BadButton>
        <ConfigProvider
          disabled={false}
          locale={{ input: { clear: 'Remove' } }}
          pagination={{ showQuickJumper: true, showTotal: undefined }}
        >
          <section aria-label="内层配置" className="flex flex-col gap-4">
            <BadInput aria-label="内层输入" defaultValue="hello" allowClear />
            <BadInput aria-label="密码" type="password" defaultValue="secret" />
            <BadInput aria-label="局部输入" clearLabel="局部清空" defaultValue="local" allowClear />
            <BadButton>内层解除禁用</BadButton>
            <BadPagination total={60} showTotal={false} />
          </section>
        </ConfigProvider>
      </div>
    </ConfigProvider>
  ),
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('button', { name: '继承外层禁用' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: '内层解除禁用' })).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Show password' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: '局部清空' })).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Go to page' })).toBeEnabled();
    await expect(within(canvas.getByRole('combobox', { name: 'Page size' })).getAllByRole('option')).toHaveLength(2);
    await expect(canvas.queryByText('60 items')).not.toBeInTheDocument();
  },
};

export const LiveValidationLocale: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.type(canvas.getByRole('textbox', { name: '跳至页码' }), '2.5');
    await userEvent.tab();
    await expect(canvas.getByRole('alert')).toHaveTextContent('请输入大于 0 的整数页码');
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '语言' }), 'en');
    await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a positive integer page number');
  },
};

function ContainerExample({ mode = 'inherit' }: { mode?: 'inherit' | 'local' | 'component-body' | 'provider-body' }) {
  const globalRef = useRef<HTMLDivElement>(null);
  const localRef = useRef<HTMLDivElement>(null);
  const override = mode === 'local' ? localRef : mode === 'component-body' ? null : undefined;
  return (
    <div className="flex flex-col gap-4">
      {/* 容器只提供 DOM 位置，不改变弹层的定位和焦点策略。目标节点无需复制到 state。 */}
      <div ref={globalRef} data-testid="global-container" />
      <div ref={localRef} data-testid="local-container" />
      <ConfigProvider locale={enUS} popupContainer={globalRef}>
        <ConfigProvider popupContainer={mode === 'provider-body' ? null : undefined}>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>打开配置弹窗</DialogTrigger>
            <BadDialogContent container={override}>
              <DialogTitle>配置弹窗</DialogTitle>
              <DialogDescription>检查全局容器、局部覆盖和 null 恢复 body。</DialogDescription>
              <DialogClose render={<Button />}>结束弹窗</DialogClose>
            </BadDialogContent>
          </Dialog>
          <BadTooltip
            container={override}
            trigger={{ children: '查看挂载提示', render: <Button variant="outline" /> }}
            content={{ role: 'tooltip', children: '挂载提示' }}
          />
          <InputPopover
            aria-label="挂载输入"
            container={override}
            renderContent={({ value, close }) => (
              <div className="flex flex-col gap-2">
                <p>输入：{value || '（空）'}</p>
                <Button onClick={close}>结束输入面板</Button>
              </div>
            )}
          />
        </ConfigProvider>
      </ConfigProvider>
    </div>
  );
}
function checkContainers(mode: 'inherit' | 'local' | 'body'): NonNullable<Story['play']> {
  return async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const body = within(canvasElement.ownerDocument.body);
    const global = canvas.getByTestId('global-container');
    const local = canvas.getByTestId('local-container');
    async function check(popup: HTMLElement) {
      await expect(global.contains(popup)).toBe(mode === 'inherit');
      await expect(local.contains(popup)).toBe(mode === 'local');
      await expect(canvasElement.ownerDocument.body.contains(popup)).toBe(true);
    }
    await userEvent.click(canvas.getByRole('button', { name: '打开配置弹窗' }));
    await check(await body.findByRole('dialog', { name: '配置弹窗' }));
    await expect(body.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    await userEvent.click(body.getByRole('button', { name: '结束弹窗' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
    const trigger = canvas.getByRole('button', { name: '查看挂载提示' });
    await userEvent.hover(trigger);
    await check(await body.findByRole('tooltip'));
    await userEvent.unhover(trigger);
    await waitFor(() => expect(body.queryByRole('tooltip')).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('combobox', { name: '挂载输入' }));
    await check(await body.findByRole('dialog', { name: 'Input panel' }));
    await userEvent.click(body.getByRole('button', { name: '结束输入面板' }));
    await waitFor(() => expect(body.queryByRole('dialog')).not.toBeInTheDocument());
  };
}
export const GlobalPopupContainer: Story = { render: () => <ContainerExample />, play: checkContainers('inherit') };
export const LocalPopupContainer: Story = {
  render: () => <ContainerExample mode="local" />,
  play: checkContainers('local'),
};
export const NullContainerOverride: Story = {
  render: () => <ContainerExample mode="component-body" />,
  play: checkContainers('body'),
};
export const NestedNullContainer: Story = {
  render: () => <ContainerExample mode="provider-body" />,
  play: checkContainers('body'),
};

export const PresentationLocale: Story = {
  render: () => (
    <ConfigProvider locale={enUS}>
      <div className="flex flex-col gap-6">
        <BadEmpty />
        <Loading />
        <TiktokLoading />
      </div>
    </ConfigProvider>
  ),
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByText('No data')).toBeVisible();
    await expect(canvas.getAllByText('Loading...')).toHaveLength(2);
    await expect(canvas.getAllByRole('status', { name: 'Loading' })).toHaveLength(2);
  },
};
