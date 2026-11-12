import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { BASE_COLORS, COLOR_THEMES, DEFAULT_PREFERENCE, RADIUS_OPTIONS } from './preference';

function ColorSwatches({
  options,
  label,
  defaultValue,
}: {
  options: readonly { value: string; label: string; color: string }[];
  label: string;
  defaultValue: string;
}) {
  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
      {options.map((option) => (
        <li key={option.value} className="flex min-w-0 flex-col gap-2">
          <div
            aria-hidden="true"
            className="h-20 rounded-md ring-1 ring-foreground/10 ring-inset"
            style={{ backgroundColor: option.color }}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <span className="text-sm font-medium">{option.label}</span>
            {option.value === defaultValue && <span className="text-xs text-muted-foreground">默认</span>}
          </div>
          <code className="text-xs break-words text-muted-foreground">{option.color}</code>
        </li>
      ))}
    </ul>
  );
}

function PreferenceCatalog() {
  return (
    <section className="flex w-full max-w-5xl flex-col gap-10 p-6 sm:p-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">外观偏好预设</h2>
        <p role="status" className="text-sm text-muted-foreground">
          默认：Neutral 基础色 · Neutral 主题 · {DEFAULT_PREFERENCE.radius}rem 圆角
        </p>
      </header>
      <section className="flex flex-col gap-4" aria-label="基础色">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">基础色</h3>
          <p className="text-sm text-muted-foreground">预览浅色模式下的 muted-foreground，用于区分中性色调。</p>
        </div>
        <ColorSwatches options={BASE_COLORS} label="基础色预设" defaultValue={DEFAULT_PREFERENCE.baseColor} />
      </section>
      <section className="flex flex-col gap-4" aria-label="主题配色">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">主题配色</h3>
          <p className="text-sm text-muted-foreground">预览浅色模式下的 primary；色块保持固定，不随预览主题切换。</p>
        </div>
        <ColorSwatches options={COLOR_THEMES} label="主题配色预设" defaultValue={DEFAULT_PREFERENCE.theme} />
      </section>
      <section className="flex flex-col gap-4" aria-label="圆角">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">圆角</h3>
          <p className="text-sm text-muted-foreground">以 rem 为单位，从直角到柔和圆角。</p>
        </div>
        <ul aria-label="圆角预设" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {RADIUS_OPTIONS.map((option) => (
            <li key={option.value} className="flex flex-col gap-3">
              <div
                aria-hidden="true"
                className="h-16 border-2 border-foreground/40 bg-muted"
                style={{ borderRadius: `${option.value}rem` }}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-1 text-sm">
                <span className="tabular-nums">{option.value}rem</span>
                {option.value === DEFAULT_PREFERENCE.radius && (
                  <span className="text-xs text-muted-foreground">默认</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

const meta = {
  title: 'Lib/Preference',
  component: PreferenceCatalog,
  parameters: {
    docs: {
      description: {
        component:
          '公开的基础色、主题配色和圆角预设。圆角以 rem 为单位；预设用于展示，不禁止调用方设置其他有限非负圆角。',
      },
    },
  },
} satisfies Meta<typeof PreferenceCatalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {
  play: async ({ canvas }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('list', { name: '基础色预设' })).toHaveTextContent('Neutral');
    // 检查默认偏好引用了真实选项，防止预设调整后默认值指向失效选项。
    await expect(BASE_COLORS.some((item) => item.value === DEFAULT_PREFERENCE.baseColor)).toBe(true);
    await expect(COLOR_THEMES.some((item) => item.value === DEFAULT_PREFERENCE.theme)).toBe(true);
    await expect(RADIUS_OPTIONS.some((item) => item.value === DEFAULT_PREFERENCE.radius)).toBe(true);
  },
};
