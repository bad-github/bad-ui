'use client';

import { EmptyComponentIcon } from './empty-component-icon';
import { EmptyPageIcon } from './empty-page-icon';
import type { ComponentProps } from 'react';
import { cn } from 'cn';

type BadEmptyProps = Omit<ComponentProps<'div'>, 'children'> & {
  type?: 'component' | 'page';
  /** 国际化文案由使用方传入，避免依赖应用的 i18n 配置。 */
  text?: string;
};

function BadEmpty({ type = 'component', text = 'No data', className, ...props }: BadEmptyProps) {
  return (
    // 透传容器属性，方便使用方设置布局、style 和 aria 属性，无需再套一层容器。
    <div
      className={cn('flex flex-col items-center gap-2 text-center text-xs text-muted-foreground', className)}
      {...props}
    >
      {/* 图标由下方文案说明，作为装饰隐藏，避免读屏重复朗读 SVG 内部标题。 */}
      {type === 'component' ? (
        <EmptyComponentIcon aria-hidden="true" focusable="false" />
      ) : (
        <EmptyPageIcon aria-hidden="true" focusable="false" />
      )}
      {text}
    </div>
  );
}

export { BadEmpty, type BadEmptyProps };
