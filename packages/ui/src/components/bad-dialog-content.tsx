'use client';

import type { ComponentProps } from 'react';
import { DialogContent, DialogPortal, DialogClose } from './dialog';
import { Button } from './button';
import { XIcon } from 'lucide-react';
import { useConfig } from '../providers/config-provider';

export type BadDialogContentProps = Omit<ComponentProps<typeof DialogContent>, 'portalProps'> & {
  /**
   * Portal 的挂载容器，支持 DOM 元素、ShadowRoot 或对应的 ref。
   * undefined 继承 ConfigProvider；null 明确挂载到 document.body。
   * 仅改变 DOM 挂载位置，不改变弹窗及遮罩的 fixed 定位。
   */
  container?: ComponentProps<typeof DialogPortal>['container'];
  /** 关闭按钮文案，优先于全局国际化配置。 */
  closeLabel?: string;
};

/** 支持自定义挂载容器的 DialogContent，需放在 Dialog 中并提供 DialogTitle。 */
export function BadDialogContent({
  container,
  closeLabel,
  children,
  showCloseButton = true,
  ...props
}: BadDialogContentProps) {
  const config = useConfig();
  // 显式 null 恢复底层 body；仅 undefined 继承全局容器。
  const actualContainer = container === undefined ? config.popupContainer : container;
  return (
    <DialogContent {...props} showCloseButton={false} portalProps={{ container: actualContainer ?? undefined }}>
      {children}
      {/* 原始 Dialog 不做国际化改造；自定义封装在此提供可配置的同款关闭按钮。 */}
      {showCloseButton && (
        <DialogClose
          data-slot="dialog-close"
          render={<Button variant="ghost" className="absolute top-2 right-2" size="icon-sm" />}
        >
          <XIcon aria-hidden="true" />
          <span className="sr-only">{closeLabel ?? config.locale.dialog.close}</span>
        </DialogClose>
      )}
    </DialogContent>
  );
}
