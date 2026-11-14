'use client';

import type { ComponentProps } from 'react';
import { DialogContent, DialogPortal } from './dialog';

export type BadDialogContentProps = Omit<ComponentProps<typeof DialogContent>, 'portalProps'> & {
  /**
   * Portal 的挂载容器，支持 DOM 元素、ShadowRoot 或对应的 ref。
   * 未指定时沿用底层默认行为，挂载到 document.body。
   * 仅改变 DOM 挂载位置，不改变弹窗及遮罩的 fixed 定位。
   */
  container?: ComponentProps<typeof DialogPortal>['container'];
};

/** 支持自定义挂载容器的 DialogContent，需放在 Dialog 中并提供 DialogTitle。 */
export function BadDialogContent({ container, ...props }: BadDialogContentProps) {
  // 复用基础组件的样式、遮罩、焦点管理和关闭按钮，只向 Portal 传递挂载容器。
  // 不额外包一层 Portal，避免内层 DialogContent 仍然挂载到 body。
  return <DialogContent {...props} portalProps={{ container }} />;
}
