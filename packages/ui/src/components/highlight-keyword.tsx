import { cn } from 'cn';
import type { ReactNode } from 'react';

// 匹配需要转义的正则元字符，确保用户关键词按普通文本处理；统一在此维护。
const REGEXP_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

export interface HighlightKeywordProps {
  /** 要显示的原始文本，不会作为 HTML 解析。 */
  text: string;
  /** 去除首尾空白后按字面量匹配；为空时不添加高亮。 */
  keyword: string;
  /** 是否区分大小写，默认 true；设为 false 时忽略大小写。 */
  caseSensitive?: boolean;
  /** 作用于匹配片段的 mark 元素，可覆盖默认高亮样式。 */
  className?: string;
}

/** 高亮全部不重叠的字面量匹配；筛选、延迟更新等行为由调用方负责。 */
export function HighlightKeyword({ text, keyword, caseSensitive = true, className }: HighlightKeywordProps) {
  const normalizedKeyword = keyword.trim();
  // 空文本或空关键词无需构建正则，也不会产生空的高亮标记。
  if (!text || !normalizedKeyword) return <>{text}</>;

  // 转义正则元字符，确保 .、*、[ 等输入只按普通文本匹配。
  // 使用原文上的匹配位置切片，避免先转小写时 Unicode 字符长度变化导致高亮错位。
  const escapedKeyword = normalizedKeyword.replace(REGEXP_SPECIAL_CHARACTERS, '\\$&');
  // g 匹配全部片段，u 使用 Unicode 模式；仅在忽略大小写时启用 i。
  const matches = text.matchAll(new RegExp(escapedKeyword, caseSensitive ? 'gu' : 'giu'));
  // 所有匹配片段使用相同样式，每次渲染只合并一次，避免逐个 mark 重复计算。
  const markClassName = cn('rounded-sm bg-primary px-0.5 font-medium text-primary-foreground', className);
  const parts: ReactNode[] = [];
  let from = 0;

  for (const match of matches) {
    const index = match.index;
    parts.push(text.slice(from, index));
    parts.push(
      <mark key={index} className={markClassName}>
        {match[0]}
      </mark>
    );
    from = index + match[0].length;
  }

  parts.push(text.slice(from));
  return <>{parts}</>;
}
