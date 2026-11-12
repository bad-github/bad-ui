import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { PreferenceProvider, usePreference } from './preference-provider';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { prepareProviderEnvironment } from '../../.storybook/testing/provider-environment';
import { dispatchStorageChange, mockStorageFailure } from '../../.storybook/testing/provider-mocks';

const storageKey = 'bad-ui:storybook:demo:preference';

function PreferenceControls() {
  // 此处 theme 是 blue / neutral 等配色，不是 ThemeProvider 的 light / dark。
  const { baseColor, theme, radius, setBaseColor, setTheme, setRadius } = usePreference();
  return (
    <section aria-label="外观偏好演示" className="flex flex-col gap-4" style={{ maxWidth: 560, padding: 24 }}>
      <h2>外观偏好</h2>
      <p role="status">基础色：{baseColor}；配色：{theme}；圆角：{radius}rem</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="调整偏好">
        <Button onClick={() => setBaseColor('zinc')}>Zinc 基础色</Button>
        <Button onClick={() => setTheme('blue')}>Blue 配色</Button>
        <Button onClick={() => setRadius(1)}>圆角 1rem</Button>
        <Button variant="outline" onClick={() => {
          // 同一事件连续修改三个字段，Provider 应合并修改而非互相覆盖。
          setBaseColor('neutral');
          setTheme('neutral');
          setRadius(0.625);
        }}>恢复标准外观</Button>
      </div>
      <Input aria-label="外观效果预览" placeholder="观察基础色、配色与圆角" />
      <p>选择会写入本示例的独立存储键；离开示例后还原预览外观。</p>
    </section>
  );
}

const meta = {
  title: 'Providers/PreferenceProvider',
  component: PreferenceProvider,
  args: { children: null, storageKey },
  render: (args) => <PreferenceProvider {...args}><PreferenceControls /></PreferenceProvider>,
  parameters: {
    docs: { description: { component: '管理基础色、主题配色与圆角，通过 usePreference 修改。写入 html 的 data-base-color、data-theme 和 --radius；深浅模式仍由 ThemeProvider 管理。' } },
  },
  argTypes: {
    children: { control: false, description: '读取外观偏好的子树，本示例使用固定演示面板。' },
    defaultPreference: { control: 'object', description: '部分默认偏好，缺失项使用 neutral / neutral / 0.625；已有有效存储值优先。' },
    storageKey: { control: false, description: '三项偏好共用的 localStorage 键；示例与应用真实偏好隔离。' },
  },
  beforeEach: ({ parameters }) => {
    const cleanup = prepareProviderEnvironment(storageKey, parameters.savedPreference);
    const restoreStorage = parameters.storageFailure ? mockStorageFailure(storageKey, parameters.storageFailure) : undefined;
    return () => { restoreStorage?.(); cleanup(); };
  },
} satisfies Meta<typeof PreferenceProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, step }) => {
    if (!shouldRunInteractions) return;
    const root = canvas.getByRole('status').ownerDocument.documentElement;
    await step('修改外观，同步 Context、根节点和存储', async () => {
      await waitFor(() => expect(root).toHaveAttribute('data-base-color', 'neutral'));
      await userEvent.click(canvas.getByRole('button', { name: 'Zinc 基础色' }));
      await userEvent.click(canvas.getByRole('button', { name: 'Blue 配色' }));
      await userEvent.click(canvas.getByRole('button', { name: '圆角 1rem' }));
      await expect(canvas.getByRole('status')).toHaveTextContent('基础色：zinc；配色：blue；圆角：1rem');
      await waitFor(() => {
        expect(root).toHaveAttribute('data-base-color', 'zinc');
        expect(root).toHaveAttribute('data-theme', 'blue');
        // CSS 自定义变量通过内联样式读取；数值单位由 Provider 转换为 rem。
        expect(root.style.getPropertyValue('--radius')).toBe('1rem');
      });
      await expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({ baseColor: 'zinc', theme: 'blue', radius: 1 });
    });
    await step('同一事件连续修改字段仍保留完整偏好', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '恢复标准外观' }));
      await expect(canvas.getByRole('status')).toHaveTextContent('基础色：neutral；配色：neutral；圆角：0.625rem');
      await expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({ baseColor: 'neutral', theme: 'neutral', radius: 0.625 });
    });
  },
};

export const CustomDefaults: Story = {
  args: { defaultPreference: { theme: 'blue', radius: 1 } },
  parameters: { docs: { description: { story: '只指定配色与圆角，基础色自动补齐为 neutral。' } } },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('status')).toHaveTextContent('基础色：neutral；配色：blue；圆角：1rem');
  },
};

export const SavedPreference: Story = {
  args: { defaultPreference: { theme: 'blue' } },
  parameters: {
    // 合法字段优先；非法 theme 与负圆角分别回退到传入默认值和库默认值。
    savedPreference: JSON.stringify({ baseColor: 'zinc', theme: 'unknown', radius: -1 }),
    docs: { description: { story: '逐项验证已保存偏好：有效基础色恢复，非法配色和圆角使用对应默认值。' } },
  },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('基础色：zinc；配色：blue；圆角：0.625rem'));
  },
};

export const CorruptedStorage: Story = {
  parameters: {
    savedPreference: '{broken-json',
    docs: { description: { story: '存储不是有效 JSON 时整体回退，避免异常阻断渲染。' } },
  },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('status')).toHaveTextContent('基础色：neutral；配色：neutral；圆角：0.625rem');
  },
};

export const StorageReadFailure: Story = {
  parameters: { storageFailure: 'getItem', docs: { description: { story: '存储读取被拒绝时仍展示默认偏好。' } } },
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('status')).toHaveTextContent('基础色：neutral；配色：neutral；圆角：0.625rem');
  },
};

export const StorageWriteFailure: Story = {
  parameters: { storageFailure: 'setItem', docs: { description: { story: '保存失败不影响当前页面的偏好更新。' } } },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '圆角 1rem' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('圆角：1rem');
    await expect(localStorage.getItem(storageKey)).toBeNull();
  },
};

export const StorageSync: Story = {
  parameters: { docs: { description: { story: '模拟跨标签页更新、无关键过滤、删除与清空通知。同步只更新页面，不向存储反写。' } } },
  play: async ({ canvas, step }) => {
    if (!shouldRunInteractions) return;
    const status = canvas.getByRole('status');
    const saved = JSON.stringify({ baseColor: 'zinc', theme: 'blue', radius: 1 });
    await step('更新后同步偏好，删除或清空后恢复默认', async () => {
      dispatchStorageChange(storageKey, saved);
      await waitFor(() => expect(status).toHaveTextContent('基础色：zinc；配色：blue；圆角：1rem'));
      dispatchStorageChange('unrelated-key', null);
      await expect(status).toHaveTextContent('配色：blue');
      dispatchStorageChange(storageKey, saved); // 相同内容不应触发额外的偏好改变。
      dispatchStorageChange(storageKey, null);
      await waitFor(() => expect(status).toHaveTextContent('基础色：neutral；配色：neutral；圆角：0.625rem'));
      dispatchStorageChange(storageKey, saved);
      await waitFor(() => expect(status).toHaveTextContent('配色：blue'));
      dispatchStorageChange(null, null);
      await waitFor(() => expect(status).toHaveTextContent('配色：neutral'));
      await expect(localStorage.getItem(storageKey)).toBeNull();
    });
  },
};
