import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { BASE_COLORS, COLOR_THEMES, DEFAULT_PREFERENCE, RADIUS_OPTIONS } from './preference';

function PreferenceCatalog() {
  return (
    <section className="flex flex-col gap-4" style={{ padding: 24 }}>
      <h2>外观偏好预设</h2>
      <p role="status">默认值：{JSON.stringify(DEFAULT_PREFERENCE)}</p>
      <h3>基础色</h3>
      <ul aria-label="基础色预设">{BASE_COLORS.map((option) => <li key={option.value}>{option.label}：{option.value}</li>)}</ul>
      <h3>主题配色</h3>
      <ul aria-label="主题配色预设">{COLOR_THEMES.map((option) => <li key={option.value}>{option.label}：{option.value}</li>)}</ul>
      <h3>圆角（rem）</h3>
      <ul aria-label="圆角预设">{RADIUS_OPTIONS.map((option) => <li key={option.value}>{option.label}：{option.value}rem</li>)}</ul>
    </section>
  );
}

const meta = {
  title: 'Lib/Preference',
  component: PreferenceCatalog,
  parameters: { docs: { description: { component: '公开的基础色、主题配色和圆角预设。圆角以 rem 为单位；预设用于展示，不禁止调用方设置其他有限非负圆角。' } } },
} satisfies Meta<typeof PreferenceCatalog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list', { name: '基础色预设' })).toHaveTextContent('Neutral');
    // 检查默认偏好引用了真实选项，防止预设调整后默认值指向失效选项。
    await expect(BASE_COLORS.some((item) => item.value === DEFAULT_PREFERENCE.baseColor)).toBe(true);
    await expect(COLOR_THEMES.some((item) => item.value === DEFAULT_PREFERENCE.theme)).toBe(true);
    await expect(RADIUS_OPTIONS.some((item) => item.value === DEFAULT_PREFERENCE.radius)).toBe(true);
  },
};
