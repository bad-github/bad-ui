'use client';

import type { ComponentProps } from 'react';
import { Button } from './button';
import { Spinner } from './spinner';
import { useConfig } from '../providers/config-provider';

export type BadButtonProps = ComponentProps<typeof Button> & {
  /** 显示加载图标并禁用交互，保留按钮原有内容。 */
  loading?: boolean;
};

export function BadButton({ loading = false, disabled, children, size, ...props }: BadButtonProps) {
  const config = useConfig();
  // Spinner 默认固定为 size-4；小按钮需同步缩小，保持原 Button 的图标尺寸。
  const spinnerClassName = size === 'xs' || size === 'icon-xs' ? 'size-3' : size === 'sm' ? 'size-3.5' : undefined;
  return (
    // 加载时通过底层 Button 禁用鼠标和键盘激活，结束后仍尊重调用方的 disabled。
    <Button
      {...props}
      size={size}
      disabled={loading || (disabled ?? config.disabled)}
      aria-busy={loading || props['aria-busy']}
    >
      {/* 状态由按钮的 aria-busy 表达，图标仅作装饰，避免重复播报 Loading。 */}
      {loading && (
        <Spinner
          role="presentation"
          aria-hidden="true"
          aria-label={undefined}
          data-icon="inline-start"
          className={spinnerClassName}
        />
      )}
      {children}
    </Button>
  );
}
