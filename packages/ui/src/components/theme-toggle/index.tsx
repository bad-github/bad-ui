'use client';

import type { ComponentProps } from 'react';
import { Button } from '../button';
import { useConfig } from '../../providers/config-provider';
import { useTheme } from '../../providers/theme-provider';
import { MoonIcon, SunIcon } from './icons';

type ThemeToggleProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  /** 切换到深色模式的无障碍文案，默认为“切换到深色主题”。 */
  darkLabel?: string;
  /** 切换到浅色模式的无障碍文案，默认为“切换到浅色主题”。 */
  lightLabel?: string;
};

function ThemeToggle({
  darkLabel: darkLabelProp,
  lightLabel: lightLabelProp,
  variant = 'outline',
  size = 'icon',
  title: titleProp,
  disabled,
  className,
  onClick,
  ...props
}: ThemeToggleProps) {
  const config = useConfig();
  const darkLabel = darkLabelProp ?? config.locale.themeToggle.darkLabel;
  const lightLabel = lightLabelProp ?? config.locale.themeToggle.lightLabel;
  const title = titleProp ?? config.locale.themeToggle.title;
  const { toggleTheme } = useTheme();
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      title={title}
      {...props}
      disabled={disabled ?? config.disabled}
      data-theme-toggle-size={size}
      // 继续使用现有 Button 的样式与状态，只追加主题图标所需的 CSS 类。
      className={
        typeof className === 'function'
          ? (state) => ['theme-toggle', className(state)].filter(Boolean).join(' ')
          : ['theme-toggle', className].filter(Boolean).join(' ')
      }
      onClick={(event) => {
        // 先执行调用方回调，允许通过 preventDefault 取消主题切换。
        onClick?.(event);
        if (!event.defaultPrevented) toggleTheme();
      }}
    >
      <MoonIcon data-icon="inline-start" aria-hidden="true" className="theme-toggle__icon theme-toggle__moon" />
      <SunIcon data-icon="inline-start" aria-hidden="true" className="theme-toggle__icon theme-toggle__sun" />
      {/* 通过原生 CSS 随 .dark 切换图标与可访问文字，避免重复维护主题状态。 */}
      <span className="theme-toggle__label theme-toggle__dark-label">{darkLabel}</span>
      <span className="theme-toggle__label theme-toggle__light-label">{lightLabel}</span>
    </Button>
  );
}

export { ThemeToggle, type ThemeToggleProps };
