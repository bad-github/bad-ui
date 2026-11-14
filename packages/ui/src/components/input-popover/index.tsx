'use client';

import { useId, useImperativeHandle, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { CompositionInput } from '../composition-input';
import { Popover } from '../popover';
import { InputPopoverContent } from './content';
import { cn } from 'cn';

type InputPopoverContentContext = {
  /** 输入框当前字符串，包括输入法尚未选字的草稿，适合实时渲染内容。 */
  value: string;
  /** 回填输入框：更新非受控状态或通知 onValueChange，不触发原生 onChange / onSearch。 */
  setValue: (value: string) => void;
  /** 仅关闭弹层并将焦点交还输入框，不清空、不回填，也不代表选中某个业务对象。 */
  close: () => void;
};

type ContentProps = Omit<
  ComponentProps<typeof InputPopoverContent>,
  'children' | 'anchor' | 'initialFocus' | 'finalFocus' | 'className' | 'id' | 'role' | 'render' | 'ref'
>;

type InputPopoverProps = Omit<
  ComponentProps<typeof CompositionInput>,
  | 'value'
  | 'defaultValue'
  | 'onFinalChange'
  | 'children'
  | 'type'
  | 'role'
  | 'aria-haspopup'
  | 'aria-expanded'
  | 'aria-controls'
> & {
  /** 受控输入值，需要在 onValueChange 或原生 onChange 中更新，包括输入法草稿。 */
  value?: string;
  /** 非受控初始输入值，只在初始化时读取。默认空字符串。 */
  defaultValue?: string;
  /** 用户编辑或内容调用 setValue 时通知；原生 onChange 仅通知真实输入事件。 */
  onValueChange?: (value: string) => void;
  /** 输入法组合结束或普通编辑时通知；可发起搜索，不内置防抖或网络请求。 */
  onSearch?: (value: string) => void;
  /** 受控开关，需要配合 onOpenChange 更新。disabled/readOnly 时强制不显示。 */
  open?: boolean;
  /** 非受控初始开关。默认 false。 */
  defaultOpen?: boolean;
  /** 焦点、输入、点击、外部交互或内容关闭请求引起开关变化时通知。 */
  onOpenChange?: (open: boolean) => void;
  /** 渲染任意非模态内容；需要 Hooks 时返回独立组件，不在此函数内直接调用 Hooks。 */
  renderContent: (context: InputPopoverContentContext) => ReactNode;
  /** 内容面板的可访问名称，可被 contentProps 中的 aria-label / aria-labelledby 覆盖。 */
  contentLabel?: string;
  /** 面板布局类名；默认与输入框等宽，且不超过当前视口可用宽度。 */
  contentClassName?: string;
  /** 面板属性和定位参数；焦点策略、锚点和 dialog 语义由封装统一管理。 */
  contentProps?: ContentProps;
};

/**
 * 输入框 + 任意内容的 Popover，不预设列表、option 或 Combobox 的键盘语义。
 * 聚焦、点击或输入时打开；Escape、点击外部或焦点离开组件时由 Popover 处理关闭。
 * 默认保持输入焦点；ArrowDown 可进入面板，再按 Tab 操作面板里的按钮等原生控件。
 */
function InputPopover({
  value,
  defaultValue = '',
  onValueChange,
  onSearch,
  open,
  defaultOpen = false,
  onOpenChange,
  renderContent,
  contentLabel = '输入辅助面板',
  contentClassName,
  contentProps,
  disabled = false,
  readOnly = false,
  onChange,
  onFocus,
  onClick,
  onKeyDown,
  ref,
  ...inputProps
}: InputPopoverProps) {
  const popupId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  // 用户点击外部时不抢回焦点；只有内容主动关闭和 Escape 关闭才返回输入框。
  const [returnFocus, setReturnFocus] = useState(false);
  const skipFocusOpen = useRef(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  // 受控值直接参与渲染，不通过 Effect 或 render 中的 setState 复制 props。
  const inputValue = value ?? internalValue;
  const interactive = !disabled && !readOnly;
  const actualOpen = interactive && (open ?? internalOpen);
  useImperativeHandle(ref, () => inputRef.current!, []);

  function changeOpen(next: boolean, restoreFocus = false) {
    if (next && !interactive) return;
    if (next === actualOpen) return;
    setReturnFocus(!next && restoreFocus);
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function changeValue(next: string) {
    if (!interactive || next === inputValue) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

  return (
    <Popover
      open={actualOpen}
      modal={false}
      onOpenChange={(next, details) => {
        // 没有把 Input 冒充按钮触发器，而是以 anchor 定位。
        // 因此需将输入框视为组件内部：重复点击/回到输入框不应被当作外部关闭。
        const event = details.event;
        const target = event.target;
        const relatedTarget = 'relatedTarget' in event ? event.relatedTarget : null;
        if (
          !next &&
          (target === inputRef.current || relatedTarget === inputRef.current) &&
          (details.reason === 'outside-press' || details.reason === 'focus-out')
        ) {
          details.cancel();
          return;
        }
        changeOpen(next, details.reason === 'escape-key');
      }}
    >
      <CompositionInput
        {...inputProps}
        ref={inputRef}
        value={inputValue}
        disabled={disabled}
        readOnly={readOnly}
        // 可编辑 combobox 可关联 dialog 弹层；不把任意业务内容错误标为 listbox/option。
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={actualOpen}
        aria-controls={actualOpen ? popupId : undefined}
        onChange={(event) => {
          // 始终显示完整草稿；onSearch 通过 CompositionInput 排除未完成的拼音输入。
          changeValue(event.currentTarget.value);
          changeOpen(true);
          onChange?.(event);
        }}
        onFinalChange={onSearch}
        onFocus={(event) => {
          onFocus?.(event);
          // 关闭后的焦点恢复不是一次新的打开意图，避免“关闭即重新打开”。
          if (skipFocusOpen.current) {
            skipFocusOpen.current = false;
            return;
          }
          if (!event.defaultPrevented) changeOpen(true);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) changeOpen(true);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing) return;
          if (event.key === 'ArrowDown' && interactive) {
            event.preventDefault();
            if (actualOpen) popupRef.current?.focus();
            else changeOpen(true);
          }
        }}
      />
      <InputPopoverContent
        {...contentProps}
        id={popupId}
        ref={popupRef}
        // 将弹层锚定到当前输入框；定位器据此计算位置和 --anchor-width（用于面板等宽）。
        // anchor 不控制开关：打开与关闭仍由上面的 Popover open/onOpenChange 管理。
        anchor={inputRef}
        align={contentProps?.align ?? 'start'}
        role="dialog"
        aria-label={contentProps?.['aria-label'] ?? contentLabel}
        className={cn('w-(--anchor-width) max-w-(--available-width)', contentClassName)}
        // 打开时不自动聚焦内容，否则输入每次打开面板都会被中断。
        initialFocus={false}
        finalFocus={() => {
          if (!interactive || !returnFocus || !inputRef.current) return false;
          if (inputRef.current.ownerDocument.activeElement !== inputRef.current) skipFocusOpen.current = true;
          return inputRef.current;
        }}
      >
        {renderContent({ value: inputValue, setValue: changeValue, close: () => changeOpen(false, true) })}
      </InputPopoverContent>
    </Popover>
  );
}

export { InputPopover, type InputPopoverProps, type InputPopoverContentContext };
