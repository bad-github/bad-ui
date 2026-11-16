import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { useId } from 'react';
import { PreferenceProvider, usePreference } from './preference-provider';
import { BASE_COLORS, COLOR_THEMES, RADIUS_OPTIONS, DEFAULT_PREFERENCE } from '../lib/preference';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Field, FieldLabel, FieldGroup } from '../components/field';
import { NativeSelect, NativeSelectOption } from '../components/native-select';
import { ToggleGroup, ToggleGroupItem } from '../components/toggle-group';
import { prepareProviderEnvironment } from '../../.storybook/testing/provider-environment';
import { dispatchStorageChange, mockStorageFailure } from '../../.storybook/testing/provider-mocks';

const storageKey = 'bad-ui:storybook:demo:preference';

type PreferenceDimension = 'baseColor' | 'theme' | 'radius';

/** 色块只显示颜色；名称用于悬停提示和读屏，选中项由外圈标记区分。 */
function ColorChoices<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string; color: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      className="flex-wrap"
      variant="outline"
      onValueChange={(values) => {
        // 当前偏好始终需要一个值；再次点击选中项时忽略取消，避免出现无选中状态。
        const option = options.find((item) => item.value === values[0]);
        if (option) onChange(option.value);
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={`${label} ${option.label}`}
          title={option.label}
          className="size-9 p-2 [&[aria-pressed=true]]:outline-2 [&[aria-pressed=true]]:outline-offset-2 [&[aria-pressed=true]]:outline-ring"
        >
          {/* 这里使用预设的真实色值，而非当前主题色，保证各选项始终呈现自身颜色。 */}
          <span aria-hidden="true" className="size-5 shrink-0 rounded-full" style={{ backgroundColor: option.color }} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function PreferenceControls({ only }: { only?: PreferenceDimension }) {
  const id = useId();
  // 此处 theme 是 blue / neutral 等配色，不是 ThemeProvider 的 light / dark。
  const { baseColor, theme, radius, setBaseColor, setTheme, setRadius } = usePreference();
  return (
    <section aria-label="外观偏好演示" className="flex w-full max-w-3xl min-w-0 flex-col gap-6 self-start p-6">
      <h2>外观偏好</h2>
      <p role="status" className="sr-only">
        基础色：{baseColor}；配色：{theme}；圆角：{radius}rem
      </p>
      {/* 直接复用库的选项常量；增加预设后，Story 自动展示完整选项。每个控件只修改自己的字段。 */}
      <FieldGroup className="flex-row flex-wrap">
        {(!only || only === 'baseColor') && (
          <Field className="w-auto">
            <FieldLabel>基础色</FieldLabel>
            <ColorChoices label="基础色" options={BASE_COLORS} value={baseColor} onChange={setBaseColor} />
          </Field>
        )}
        {(!only || only === 'theme') && (
          <Field className="w-auto">
            <FieldLabel>配色</FieldLabel>
            <ColorChoices label="配色" options={COLOR_THEMES} value={theme} onChange={setTheme} />
          </Field>
        )}
        {(!only || only === 'radius') && (
          <Field className="w-auto">
            <FieldLabel htmlFor={`${id}-radius`}>圆角</FieldLabel>
            <NativeSelect
              id={`${id}-radius`}
              value={radius}
              onChange={(event) => setRadius(Number(event.currentTarget.value))}
            >
              {/* Provider 支持任意非负圆角；自定义默认值或存储值不在预设中时仍应正确显示。 */}
              {!RADIUS_OPTIONS.some(({ value }) => value === radius) && (
                <NativeSelectOption value={radius}>{radius}rem（自定义）</NativeSelectOption>
              )}
              {RADIUS_OPTIONS.map(({ value, label }) => (
                <NativeSelectOption key={value} value={value}>
                  {value}rem{label === 'Default' ? '（默认）' : ''}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        )}
      </FieldGroup>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            // 同一事件连续修改三个字段，Provider 应合并修改而非互相覆盖。
            setBaseColor(DEFAULT_PREFERENCE.baseColor);
            setTheme(DEFAULT_PREFERENCE.theme);
            setRadius(DEFAULT_PREFERENCE.radius);
          }}
        >
          恢复标准外观
        </Button>
      </div>
      {/* 使用真实主题变量：背景/边框显示基础色，主按钮显示配色，组件边缘显示圆角。 */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground">
        <p>效果预览</p>
        <p className="text-sm text-muted-foreground">基础色影响背景与边框，配色影响主按钮，圆角影响组件边缘。</p>
        <Input aria-label="外观效果预览" placeholder="输入内容查看输入框效果" />
        <div className="flex flex-wrap gap-2">
          <Button>主按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">边框按钮</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        选择仅保存到示例专用存储；离开后还原外观。深浅模式可通过预览工具栏切换。
      </p>
    </section>
  );
}

const meta = {
  title: 'Providers/PreferenceProvider',
  component: PreferenceProvider,
  args: { children: null, storageKey },
  render: (args) => (
    <PreferenceProvider {...args}>
      <PreferenceControls />
    </PreferenceProvider>
  ),
  parameters: {
    docs: {
      story: { height: 620 },
      description: {
        component:
          '管理基础色、主题配色与圆角，通过 usePreference 分别修改。Default 可组合所有选项，Base Colors、Color Themes、Radius 可单独观察每项效果；深浅模式仍由 ThemeProvider 管理。',
      },
    },
  },
  argTypes: {
    children: { control: false, description: '读取外观偏好的子树，本示例使用固定演示面板。' },
    defaultPreference: {
      control: 'object',
      description: '部分默认偏好，缺失项使用 neutral / neutral / 0.625；已有有效存储值优先。',
    },
    storageKey: { control: false, description: '三项偏好共用的 localStorage 键；示例与应用真实偏好隔离。' },
  },
  beforeEach: ({ parameters }) => {
    const cleanup = prepareProviderEnvironment(storageKey, parameters.savedPreference);
    const restoreStorage = parameters.storageFailure
      ? mockStorageFailure(storageKey, parameters.storageFailure)
      : undefined;
    return () => {
      restoreStorage?.();
      cleanup();
    };
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
      await userEvent.click(canvas.getByRole('button', { name: '基础色 Zinc' }));
      await userEvent.click(canvas.getByRole('button', { name: '配色 Blue' }));
      await userEvent.selectOptions(canvas.getByRole('combobox', { name: '圆角' }), '1');
      await expect(canvas.getByRole('status')).toHaveTextContent('基础色：zinc；配色：blue；圆角：1rem');
      await waitFor(() => {
        expect(root).toHaveAttribute('data-base-color', 'zinc');
        expect(root).toHaveAttribute('data-theme', 'blue');
        // CSS 自定义变量通过内联样式读取；数值单位由 Provider 转换为 rem。
        expect(root.style.getPropertyValue('--radius')).toBe('1rem');
      });
      await expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({
        baseColor: 'zinc',
        theme: 'blue',
        radius: 1,
      });
    });
    await step('同一事件连续修改字段仍保留完整偏好', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '恢复标准外观' }));
      await expect(canvas.getByRole('status')).toHaveTextContent('基础色：neutral；配色：neutral；圆角：0.625rem');
      await expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({
        baseColor: 'neutral',
        theme: 'neutral',
        radius: 0.625,
      });
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

export const BaseColors: Story = {
  render: (args) => (
    <PreferenceProvider {...args}>
      <PreferenceControls only="baseColor" />
    </PreferenceProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const root = canvas.getByRole('status').ownerDocument.documentElement;
    // 遍历全部预设，并验证单项切换不会覆盖另外两项。
    for (const { value, label } of BASE_COLORS) {
      await userEvent.click(canvas.getByRole('button', { name: `基础色 ${label}` }));
      await expect(canvas.getByRole('button', { name: `基础色 ${label}` })).toHaveAttribute('aria-pressed', 'true');
      await waitFor(() => expect(root).toHaveAttribute('data-base-color', value));
      await expect(canvas.getByRole('status')).toHaveTextContent(`基础色：${value}；配色：neutral；圆角：0.625rem`);
    }
  },
};

export const ColorThemes: Story = {
  render: (args) => (
    <PreferenceProvider {...args}>
      <PreferenceControls only="theme" />
    </PreferenceProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const root = canvas.getByRole('status').ownerDocument.documentElement;
    for (const { value, label } of COLOR_THEMES) {
      await userEvent.click(canvas.getByRole('button', { name: `配色 ${label}` }));
      await expect(canvas.getByRole('button', { name: `配色 ${label}` })).toHaveAttribute('aria-pressed', 'true');
      await waitFor(() => expect(root).toHaveAttribute('data-theme', value));
      await expect(canvas.getByRole('status')).toHaveTextContent(`基础色：neutral；配色：${value}；圆角：0.625rem`);
    }
  },
};

export const Radius: Story = {
  render: (args) => (
    <PreferenceProvider {...args}>
      <PreferenceControls only="radius" />
    </PreferenceProvider>
  ),
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const root = canvas.getByRole('status').ownerDocument.documentElement;
    for (const { value } of RADIUS_OPTIONS) {
      await userEvent.selectOptions(canvas.getByRole('combobox', { name: '圆角' }), String(value));
      await waitFor(() => expect(root.style.getPropertyValue('--radius')).toBe(`${value}rem`));
      await expect(canvas.getByRole('status')).toHaveTextContent(`基础色：neutral；配色：neutral；圆角：${value}rem`);
    }
  },
};

export const CustomRadius: Story = {
  args: { defaultPreference: { radius: 0.875 } },
  parameters: {
    docs: {
      description: { story: '圆角不受预设限制；传入非预设默认值时，选择器显示自定义值，并仍可切换回任意预设。' },
    },
  },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    const select = canvas.getByRole('combobox', { name: '圆角' });
    await expect(select).toHaveValue('0.875');
    await userEvent.selectOptions(select, '0');
    await expect(canvas.getByRole('status')).toHaveTextContent('圆角：0rem');
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
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent('基础色：zinc；配色：blue；圆角：0.625rem')
    );
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
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: '圆角' }), '1');
    await expect(canvas.getByRole('status')).toHaveTextContent('圆角：1rem');
    await expect(localStorage.getItem(storageKey)).toBeNull();
  },
};

export const StorageSync: Story = {
  parameters: {
    docs: { description: { story: '模拟跨标签页更新、无关键过滤、删除与清空通知。同步只更新页面，不向存储反写。' } },
  },
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
