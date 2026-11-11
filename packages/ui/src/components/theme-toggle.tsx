'use client';

import type { ComponentProps } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@badnpm/ui/components/button';
import { useTheme } from '@badnpm/ui/providers/theme-provider';

export type ThemeToggleProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  /** 切换到深色模式的无障碍文案，默认为“切换到深色主题”。 */
  darkLabel?: string;
  /** 切换到浅色模式的无障碍文案，默认为“切换到浅色主题”。 */
  lightLabel?: string;
};

export function ThemeToggle({
  darkLabel = '切换到深色主题',
  lightLabel = '切换到浅色主题',
  variant = 'outline',
  size = 'icon',
  title = '切换主题',
  onClick,
  ...props
}: ThemeToggleProps) {
  const { toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      title={title}
      {...props}
      onClick={(event) => {
        // 先执行使用方回调，允许通过 preventDefault() 取消主题切换。
        onClick?.(event);
        if (!event.defaultPrevented) toggleTheme();
      }}
    >
      <MoonIcon
        data-icon="inline-start"
        aria-hidden="true"
        className="animate-in duration-200 ease-out zoom-in-75 fade-in spin-in-90 motion-reduce:animate-none dark:hidden"
      />
      <SunIcon
        data-icon="inline-start"
        aria-hidden="true"
        className="hidden animate-in duration-200 ease-out zoom-in-75 fade-in spin-in-90 motion-reduce:animate-none dark:block"
      />
      <span className="sr-only dark:hidden">{darkLabel}</span>
      <span className="sr-only hidden dark:block">{lightLabel}</span>
    </Button>
  );
}
