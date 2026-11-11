'use client';

import { createContext, useState, useCallback, useLayoutEffect, useEffect, useMemo, useContext } from 'react';
import type { ReactNode } from 'react';

import { useHydrated } from '@workspace/ui/hooks/use-hydrated';

type Theme = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

type ThemeProviderProps = {
  children: ReactNode;
  /** 没有有效的已保存主题时使用的模式，默认为 'system'（跟随系统配色）。 */
  defaultTheme?: Theme;
  /** 在 localStorage 中保存主题选择的键名，默认为 'bad-ui:theme'。 */
  storageKey?: string;
  /** 切换主题时是否短暂禁用全页 CSS transition，让新配色立即生效。默认为 true。 */
  disableTransitionOnChange?: boolean;
  /** 切换深浅主题的全局单键快捷键，使用 KeyboardEvent.key（如 'd' 或 'F8'），忽略大小写。省略时关闭。 */
  keyboardShortcut?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** 根据当前实际配色切换深浅模式，切换后停止跟随系统。 */
  toggleTheme: () => void;
};

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

// 校验存储值，同时将类型收窄为合法的主题选项。
function isTheme(value: string | null): value is Theme {
  return value === 'dark' || value === 'light' || value === 'system';
}

// 优先读取已保存的主题；值无效或存储不可用时使用默认主题。
function readTheme(storageKey: string, fallback: Theme): Theme {
  try {
    const value = localStorage.getItem(storageKey);
    return isTheme(value) ? value : fallback;
  } catch {
    // 存储不可用时回退到默认主题，不影响组件初始化。
    return fallback;
  }
}

// 持久化用户选择，存储失败时仍允许更新页面主题。
function persistTheme(storageKey: string, theme: Theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // 忽略存储异常，主题仍可在当前页面内切换。
  }
}

// 将用户选择解析为实际配色；system 每次读取当前系统偏好。
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') {
    return theme;
  }

  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
}

// 更新根元素的主题类名，并返回清理临时样式及动画帧的函数。
function applyTheme(theme: Theme, disableTransitionOnChange: boolean) {
  const root = document.documentElement;
  const resolvedTheme = resolveTheme(theme);

  // 主题已生效且没有冲突类名时，跳过重复的 DOM 操作。
  if (root.classList.contains(resolvedTheme) && !root.classList.contains(resolvedTheme === 'dark' ? 'light' : 'dark')) {
    return () => {};
  }

  const style = disableTransitionOnChange ? document.createElement('style') : null;

  if (style) {
    style.textContent = '*,*::before,*::after{transition:none!important}';
    document.head.appendChild(style);
    // 强制浏览器计算样式，确保禁用过渡的规则先于主题切换生效。
    window.getComputedStyle(root).getPropertyValue('transition-property');
  }

  root.classList.remove('light', 'dark');
  root.classList.add(resolvedTheme);

  if (!style) {
    return () => {};
  }

  // 在禁用过渡期间计算新主题样式，再通过两次动画帧延迟移除规则。
  window.getComputedStyle(root).getPropertyValue('color');
  let frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => style.remove());
  });

  // 重新应用主题或卸载时，取消待执行的帧并移除临时样式。
  return () => {
    cancelAnimationFrame(frame);
    style.remove();
  };
}

// 判断事件是否来自可编辑区域，避免主题快捷键干扰输入。
function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return target.closest('input, textarea, select') !== null;
}

// 统一管理主题状态、页面样式及系统和跨标签页同步。
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'bad-ui:theme',
  disableTransitionOnChange = true,
  keyboardShortcut,
}: ThemeProviderProps) {
  const hydrated = useHydrated();
  const [storedTheme, setThemeState] = useState<Theme>(() => readTheme(storageKey, defaultTheme));
  // 水合首帧与服务端一致，完成后才使用浏览器保存的主题。
  const theme = hydrated ? storedTheme : defaultTheme;

  // 所有主动切换共用此入口，统一更新存储和 React 状态。
  const setTheme = useCallback(
    (nextTheme: Theme) => {
      persistTheme(storageKey, nextTheme);
      setThemeState(nextTheme);
    },
    [storageKey]
  );

  // 按需解析系统配色，按钮和快捷键共用同一切换逻辑。
  const toggleTheme = useCallback(() => {
    setTheme(resolveTheme(theme) === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // 水合完成后应用主题；服务端与水合首帧不访问系统配色或修改根元素。
  useLayoutEffect(() => {
    if (!hydrated) return;

    let cleanup = applyTheme(theme, disableTransitionOnChange);
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    const handleChange = () => {
      cleanup();
      cleanup = applyTheme(theme, disableTransitionOnChange);
    };

    // 仅跟随系统时订阅配色变化；显式选择深浅色后不再跟随。
    if (theme === 'system') {
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      cleanup();
    };
  }, [theme, disableTransitionOnChange, hydrated]);

  useEffect(() => {
    if (!hydrated || !keyboardShortcut) return;

    const shortcutKey = keyboardShortcut.toLowerCase();

    // 忽略已处理事件、输入法组合和长按重复。
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.repeat) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key.toLowerCase() !== shortcutKey) {
        return;
      }

      toggleTheme();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleTheme, hydrated, keyboardShortcut]);

  useEffect(() => {
    // storage 事件用于接收同源其他标签页的主题变更。
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      // clear() 触发的事件 key 为 null，也需要回退到默认主题。
      if (event.key !== null && event.key !== storageKey) {
        return;
      }

      if (isTheme(event.newValue)) {
        setThemeState(event.newValue);
        return;
      }

      // 存储项被移除、清空或写入无效值时，恢复默认主题。
      setThemeState(defaultTheme);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [defaultTheme, storageKey]);

  // 保持上下文值的引用稳定，避免父组件重渲染引起无关更新。
  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

// 获取主题上下文，并在缺少 Provider 时给出明确错误。
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
