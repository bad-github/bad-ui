'use client';

import type { ComponentProps } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from 'cn';
import type { PopoverContent } from '../popover';

/**
 * 沿用现有 PopoverContent 的内容、定位和焦点属性，只额外增加 anchor。
 */
export type InputPopoverContentProps = ComponentProps<typeof PopoverContent> & {
  /**
   * 弹层的定位参照物，可传 DOM 元素、ref 或虚拟锚点。
   * 例如传入 inputRef 后，side="bottom" 表示显示在输入框下方，align="start"
   * 表示与输入框起始边对齐；底层也会根据可用空间调整位置以避免溢出。
   * Positioner 根据锚点尺寸提供 --anchor-width，供内容设置与输入框等宽。
   * 底层会追踪锚点位置和尺寸的变化，滚动或布局变化时更新弹层定位。
   * 它只负责定位参照，不会创建触发按钮，也不控制打开、关闭或输入焦点。
   */
  anchor?: PopoverPrimitive.Positioner.Props['anchor'];
};

// 沿用现有 Popover 的主题令牌、间距和动画，扩展组件独立维护，避免改动基础组件。
const contentClassName =
  'z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95';

/**
 * InputPopover 专用的内容层，与现有 Popover 共用底层上下文。
 * 原 PopoverContent 内部固定创建 Portal / Positioner，无法通过外层包裹传入锚点；
 * 因此在这里独立组合相同的 Popover 原语，将额外定位能力限制在新组件中。
 */
export function InputPopoverContent({
  anchor,
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  ...props
}: InputPopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        // InputPopover 没有按钮 Trigger，必须用输入框作为定位参照，避免弹层失去锚点。
        anchor={anchor}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          data-input-popover-content=""
          // 保留底层函数式 className 的能力，调用方可以根据开关与定位状态追加样式。
          className={
            typeof className === 'function'
              ? (state) => cn(contentClassName, className(state))
              : cn(contentClassName, className)
          }
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}
