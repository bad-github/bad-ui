import { createContext, useMemo, useState, useCallback, useLayoutEffect, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

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

type PreferenceProviderProps = {
  children: ReactNode;
  /** 可只覆盖部分默认值；已有的有效存储值优先。 */
  defaultPreference?: Partial<Preference>;
  /** 三项偏好共用的 localStorage 键，与深浅模式的存储键分开。 */
  storageKey?: string;
};

type PreferenceContextValue = Preference & {
  setBaseColor: (baseColor: BaseColor) => void;
  setTheme: (theme: ColorTheme) => void;
  setRadius: (radius: number) => void;
};

const DEFAULT_PREFERENCE: Preference = {
  baseColor: 'neutral',
  theme: 'neutral',
  radius: 0.625,
};

const PreferenceContext = createContext<PreferenceContextValue | undefined>(undefined);

// 校验选项标识，并将 unknown 收窄为对应的字符串联合类型。
function isOption<T extends string>(options: readonly { readonly value: T }[], value: unknown): value is T {
  return options.some((option) => option.value === value);
}

// 存储内容不可信：逐项校验，单个字段无效时不影响其他有效偏好。
function normalizePreference(value: unknown, fallback: Preference): Preference {
  const candidate = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

  return {
    baseColor: isOption(BASE_COLORS, candidate.baseColor) ? candidate.baseColor : fallback.baseColor,
    theme: isOption(COLOR_THEMES, candidate.theme) ? candidate.theme : fallback.theme,
    // 预设用于展示，不限制自定义圆角；只接受有限的非负数。
    radius:
      typeof candidate.radius === 'number' && Number.isFinite(candidate.radius) && candidate.radius >= 0
        ? candidate.radius
        : fallback.radius,
  };
}

// 解析并校验存储字符串；没有记录或 JSON 损坏时回退到默认值。
function parsePreference(value: string | null, fallback: Preference): Preference {
  try {
    return normalizePreference(value === null ? null : JSON.parse(value), fallback);
  } catch {
    return fallback;
  }
}

// 将存储访问与 JSON 解析分开处理，兼容浏览器禁止存储的情况。
function readPreference(storageKey: string, fallback: Preference): Preference {
  try {
    return parsePreference(localStorage.getItem(storageKey), fallback);
  } catch {
    // 存储不可用时，偏好仍可在当前页面内使用。
    return fallback;
  }
}

// 管理基础色、主题配色和圆角；深浅模式继续由 ThemeProvider 管理。
export function PreferenceProvider({
  children,
  defaultPreference,
  storageKey = 'preference',
}: PreferenceProviderProps) {
  // 先补齐并校验调用方传入的默认值，再作为存储读取和重置时的回退值。
  const { baseColor, theme, radius } = normalizePreference(defaultPreference, DEFAULT_PREFERENCE);
  const defaults = useMemo(() => ({ baseColor, theme, radius }), [baseColor, theme, radius]);
  // 惰性初始化：仅在挂载时读取存储，避免每次渲染都访问 localStorage。
  const [preference, setPreference] = useState(() => readPreference(storageKey, defaults));

  // 基于最新状态只更新基础色，保留主题与圆角；无效输入沿用当前值。
  const setBaseColor = useCallback((nextBaseColor: BaseColor) => {
    setPreference((current) => normalizePreference({ ...current, baseColor: nextBaseColor }, current));
  }, []);

  // 此处 theme 是配色方案（如 blue），并非 light / dark / system。
  const setTheme = useCallback((nextTheme: ColorTheme) => {
    setPreference((current) => normalizePreference({ ...current, theme: nextTheme }, current));
  }, []);

  // 圆角以 rem 保存，转换为 CSS 长度的工作由下方 effect 统一完成。
  const setRadius = useCallback((nextRadius: number) => {
    setPreference((current) => normalizePreference({ ...current, radius: nextRadius }, current));
  }, []);

  // 配色通过独立属性组合；圆角以内联变量覆盖主题默认值，不改动深浅模式类名。
  useLayoutEffect(() => {
    const root = document.documentElement;
    // 在浏览器绘制前更新属性，分别匹配 base-color 和 themes 中的选择器。
    root.dataset.baseColor = preference.baseColor;
    root.dataset.theme = preference.theme;
    root.style.setProperty('--radius', `${preference.radius}rem`);
  }, [preference]);

  // 初始化及偏好变化后统一持久化，将存储副作用与状态更新函数分离。
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preference));
    } catch {
      // 写入失败不阻断页面偏好更新。
    }
  }, [preference, storageKey]);

  useEffect(() => {
    // 接收其他标签页的变更；删除或清空存储时恢复默认偏好。
    function handleStorageChange(event: StorageEvent) {
      // 只处理 localStorage 中当前键的变化；clear() 的事件 key 为 null。
      if (event.storageArea !== localStorage || (event.key !== null && event.key !== storageKey)) {
        return;
      }

      const next = parsePreference(event.newValue, defaults);
      // 值相同时复用原对象，避免重复渲染和无意义的持久化写入。
      setPreference((current) =>
        current.baseColor === next.baseColor && current.theme === next.theme && current.radius === next.radius
          ? current
          : next
      );
    }

    window.addEventListener('storage', handleStorageChange);
    // 卸载或依赖变化时注销监听，避免重复订阅。
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [defaults, storageKey]);

  // 保持 Context 值的引用稳定，避免父组件重渲染引起无关的订阅更新。
  const value = useMemo(
    () => ({ ...preference, setBaseColor, setTheme, setRadius }),
    [preference, setBaseColor, setTheme, setRadius]
  );

  return <PreferenceContext.Provider value={value}>{children}</PreferenceContext.Provider>;
}

// 统一读取偏好上下文，在缺少 Provider 时给出明确的使用错误。
export function usePreference() {
  const context = useContext(PreferenceContext);

  if (context === undefined) {
    throw new Error('usePreference must be used within a PreferenceProvider');
  }

  return context;
}
