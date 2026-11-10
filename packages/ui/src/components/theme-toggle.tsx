import { MoonIcon, SunIcon } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { useTheme } from '@workspace/ui/providers/theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    // 跟随系统时，依据当前系统配色切换到相反主题。
    const isDark =
      theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <Button type="button" variant="outline" size="icon" onClick={toggleTheme} title="切换主题">
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
      <span className="sr-only dark:hidden">切换到深色主题</span>
      <span className="sr-only hidden dark:block">切换到浅色主题</span>
    </Button>
  );
}
