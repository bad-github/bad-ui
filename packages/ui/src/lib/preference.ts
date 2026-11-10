// color 用于选项色块预览：基础色取浅色模式的 muted-foreground，主题色取 primary。
export const BASE_COLORS = [
  { value: 'neutral', label: 'Neutral', color: 'oklch(0.556 0 0)' },
  { value: 'mist', label: 'Mist', color: 'oklch(0.56 0.021 213.5)' },
  { value: 'zinc', label: 'Zinc', color: 'oklch(0.552 0.016 285.938)' },
] as const;

// value 对应 CSS 的 data-theme 属性，label 用于展示，color 是固定的预览色。
export const COLOR_THEMES = [
  { value: 'neutral', label: 'Neutral', color: 'oklch(0.205 0 0)' },
  { value: 'blue', label: 'Blue', color: 'oklch(0.488 0.243 264.376)' },
  { value: 'green', label: 'Green', color: 'oklch(0.527 0.154 150.069)' },
  { value: 'orange', label: 'Orange', color: 'oklch(0.553 0.195 38.402)' },
  { value: 'pink', label: 'Pink', color: 'oklch(0.525 0.223 3.958)' },
  { value: 'purple', label: 'Purple', color: 'oklch(0.496 0.265 301.924)' },
  { value: 'red', label: 'Red', color: 'oklch(0.505 0.213 27.518)' },
  { value: 'rose', label: 'Rose', color: 'oklch(0.514 0.222 16.935)' },
  { value: 'sky', label: 'Sky', color: 'oklch(0.5 0.134 242.749)' },
  { value: 'yellow', label: 'Yellow', color: 'oklch(0.852 0.199 91.936)' },
] as const;

// 圆角预设的 value 单位为 rem，可直接传给 setRadius，也可用于 borderRadius 预览。
export const RADIUS_OPTIONS = [
  { value: 0, label: '0' },
  { value: 0.25, label: '0.25' },
  { value: 0.5, label: '0.5' },
  { value: 0.625, label: 'Default' },
  { value: 0.75, label: '0.75' },
  { value: 1, label: '1' },
] as const;

// 从选项集合推导合法标识，避免手动维护重复的联合类型。
export type BaseColor = (typeof BASE_COLORS)[number]['value'];
export type ColorTheme = (typeof COLOR_THEMES)[number]['value'];

export type Preference = {
  baseColor: BaseColor;
  theme: ColorTheme;
  /** 根字号单位 rem；0 表示直角，默认 0.625。 */
  radius: number;
};

export const DEFAULT_PREFERENCE: Preference = {
  baseColor: 'neutral',
  theme: 'neutral',
  radius: 0.625,
};
