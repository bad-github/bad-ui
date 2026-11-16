'use client';

import { useRef, type ComponentProps } from 'react';
import { Input } from './input';
import { useConfig } from '../providers/config-provider';

export type CompositionInputProps = ComponentProps<typeof Input> & {
  /**
   * 普通输入时立即通知；输入法组合期间不通知，组合结束后通知最终字符串。
   * 可用于筛选或搜索，但组件本身不做筛选、防抖或请求。
   * 原生 onChange 仍会收到组合期间的中间输入。
   */
  onFinalChange?: (value: string) => void;
};

/**
 * 支持输入法组合的输入框，只向 onFinalChange 通知已完成的输入。
 * 受控：传入 value，并在 onChange 中同步所有输入（包括拼音草稿）；
 * onFinalChange 仅用于搜索、筛选等业务，不能代替受控值的 onChange 更新。
 * 非受控：传入 defaultValue，由底层 Input 管理输入值，无需额外 state。
 * 使用期间保持同一种模式，不要切换受控与非受控。
 *
 * 以中文输入法输入“ni”并选定“你”为例，常见的事件过程是：
 * 1. compositionstart：开始组合文字，此时输入内容尚未确定。
 * 2. 多次 onChange：输入、修改拼音，继续更新输入框，但不通知 onFinalChange。
 * 3. compositionend：本轮组合结束，读取输入框完整值并通知 onFinalChange。
 * 4. 部分浏览器还会补发同值 onChange，通过 lastCompositionValue 跳过重复通知。
 * 不同系统、输入法和浏览器的事件顺序可能不同，上述过程不是固定保证。
 * 直接输入英文、删除、粘贴等不经过组合的编辑，通常直接通过 onChange 通知最终值。
 */
export function CompositionInput({
  value,
  disabled,
  defaultValue,
  onFinalChange,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  ...props
}: CompositionInputProps) {
  const config = useConfig();
  // 这些标记只用于事件判断，不影响 UI，因此用 ref 避免额外渲染。
  const isComposing = useRef(false);
  const lastCompositionValue = useRef<string | null>(null);

  return (
    <Input
      {...props}
      disabled={disabled ?? config.disabled}
      // 沿用 Input 的受控/非受控语义，不复制 value，也不在 Effect 或 render 中同步 state。
      value={value}
      defaultValue={defaultValue}
      onChange={(event) => {
        // 输入框内容被用户编辑时触发，包含普通编辑和输入法组合期间的中间变化。
        // next 是整个输入框的当前值，不只是本次新输入的字符。
        const next = event.currentTarget.value;
        // 同时检查组合事件标记与原生事件，兼容不同浏览器的输入事件顺序。
        const nativeComposing = 'isComposing' in event.nativeEvent && event.nativeEvent.isComposing === true;
        if (!isComposing.current && !nativeComposing) {
          // compositionend 已通知最终值；若浏览器紧接着补发同值 change，只跳过这一次。
          // 普通后续编辑仍正常通知，不是按字符串做永久去重。
          if (lastCompositionValue.current !== next) onFinalChange?.(next);
          lastCompositionValue.current = null;
        }
        // 保留原生 onChange 语义：即便仍在输入拼音，也继续透传事件。
        onChange?.(event);
      }}
      onCompositionStart={(event) => {
        // 输入法开始一轮文字组合时触发，例如开始输入拼音并出现候选字。
        // 不是每次按键都触发；本轮组合期间的 onChange 只透传给调用方更新输入值，
        // 不通知 onFinalChange，避免拿尚未选定的拼音执行搜索或筛选。
        isComposing.current = true;
        // 新一轮输入法组合不能沿用上一轮的去重值。
        lastCompositionValue.current = null;
        onCompositionStart?.(event);
      }}
      onCompositionEnd={(event) => {
        // 输入法完成或取消本轮组合时触发，例如选定候选字结束组合。
        // 它表示组合结束，不等同于按下 Enter 或输入框失焦，也不保证值一定变化。
        // 取消组合时也沿用此处的通知逻辑，由调用方决定是否处理相同值。
        const next = event.currentTarget.value;
        isComposing.current = false;
        lastCompositionValue.current = next;
        // 无论是否会收到后续 change，都在组合结束时通知最终值，避免漏掉选字结果。
        onFinalChange?.(next);
        onCompositionEnd?.(event);
      }}
    />
  );
}
