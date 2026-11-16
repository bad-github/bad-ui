'use client';

import type { ComponentProps } from 'react';
import { cn } from 'cn';
import { useConfig, type PopupContainer } from '../../providers/config-provider';
import { BadTooltipContent } from './content';
import { Tooltip, TooltipProvider, TooltipTrigger } from '../tooltip';

type BadTooltipProps = Omit<ComponentProps<typeof Tooltip>, 'children'> & {
  /** 使用 render 指定触发元素，children 提供默认按钮内的内容。 */
  trigger: ComponentProps<typeof TooltipTrigger>;
  /** 提示内容与定位参数；className 与默认的长文本换行样式合并。 */
  content: Omit<ComponentProps<typeof BadTooltipContent>, 'container'>;
  /** 局部挂载容器，null 恢复 body。 */
  container?: PopupContainer;
};

/** Tooltip 的快捷组合入口，根组件的开关状态和事件仍通过其余 props 透传。 */
function BadTooltip({ trigger, content, container, disabled, ...props }: BadTooltipProps) {
  const config = useConfig();
  const { className, ...contentProps } = content;
  // Base UI 支持函数形式的 className，合并时仍需将当前状态传给调用方。
  const contentClassName: ComponentProps<typeof BadTooltipContent>['className'] =
    typeof className === 'function'
      ? (state) => cn('max-w-xs break-all', className(state))
      : cn('max-w-xs break-all', className);
  return (
    // 保留独立 Provider：沿用项目默认的零延迟显示；每个实例的延迟组互不共享。
    <TooltipProvider>
      <Tooltip {...props} disabled={disabled ?? config.disabled}>
        <TooltipTrigger {...trigger} />
        <BadTooltipContent
          container={container === undefined ? config.popupContainer : container}
          {...contentProps}
          className={contentClassName}
        />
      </Tooltip>
    </TooltipProvider>
  );
}

export { BadTooltip, type BadTooltipProps };
