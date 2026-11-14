'use client';

import { useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from 'cn';
import { Button } from './button';
import { Input } from './input';
import { Field, FieldLabel, FieldError } from './field';
import { NativeSelect, NativeSelectOption } from './native-select';
import { Pagination, PaginationContent, PaginationItem, PaginationEllipsis } from './pagination';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export type BadPaginationProps = Omit<ComponentProps<typeof Pagination>, 'children' | 'onChange'> & {
  /** 数据总条数，不是总页数。负数、NaN、Infinity 按 0 处理，小数向下取整。默认 0。 */
  total?: number;
  /** 当前页，从 1 开始。传入后为受控模式，需在 onChange 中更新。 */
  current?: number;
  /** 非受控初始页码，仅初始化时读取。默认 1。 */
  defaultCurrent?: number;
  /** 每页条数。传入后为受控模式，需在 onChange 中更新。 */
  pageSize?: number;
  /** 非受控初始条数，仅初始化时读取。默认 10。 */
  defaultPageSize?: number;
  /** 每页条数选项；过滤无效值并去重，当前条数不在选项中时会自动补入。 */
  pageSizeOptions?: readonly number[];
  /** 是否显示每页条数选择器。默认 false。 */
  showSizeChanger?: boolean;
  /** 是否显示跳页输入，具体提交方式由 quickJumperTrigger 决定。默认 false。 */
  showQuickJumper?: boolean;
  /** 跳页提交方式：blur 失焦自动提交且不显示按钮；button 显示跳转按钮。均支持 Enter，默认 blur。 */
  quickJumperTrigger?: 'blur' | 'button';
  /** 显示总条数，或自定义总数与当前记录范围；空数据的 range 为 [0, 0]。默认 false。 */
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  /** 禁用全部分页操作。默认 false。 */
  disabled?: boolean;
  /** 上一页按钮的自定义内容，如双箭头图标；不传时显示默认箭头和文字。请勿嵌套按钮或链接。 */
  previousContent?: ReactNode;
  /** 下一页按钮的自定义内容，如双箭头图标；不传时显示默认箭头和文字。请勿嵌套按钮或链接。 */
  nextContent?: ReactNode;
  /**
   * 用户切页或修改条数时通知一次，参数为最终页码和条数。
   * 修改条数时页码回到 1；点击当前页不通知；外部 props 变化不自动触发通知。
   */
  onChange?: (page: number, pageSize: number) => void;
};

/** 将页码/条数归一为安全的正整数，防止除零、无穷页数和非法数组长度。 */
function positiveInteger(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, Math.floor(value)))
    : fallback;
}

/**
 * 仅生成首尾页和当前页附近的页码；数量与总页数无关，百万页也不会创建百万个节点。
 * 靠近首尾时补足相邻页；只有一页被省略时直接显示该页，避免无意义的省略号。
 */
function getPageItems(current: number, count: number): PageItem[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const start = Math.max(2, Math.min(current - 1, count - 4));
  const end = Math.min(count - 1, Math.max(current + 1, 5));
  const items: PageItem[] = [1];
  if (start === 3) items.push(2);
  else if (start > 3) items.push('ellipsis-start');
  for (let page = start; page <= end; page++) items.push(page);
  if (end === count - 2) items.push(count - 1);
  else if (end < count - 2) items.push('ellipsis-end');
  items.push(count);
  return items;
}

/**
 * 复用 Pagination 的布局与页码外观，增加条数选择、总数和跳页功能。
 * 不请求或切分数据；调用方通过 onChange 更新列表。受控值与非受控默认值不要混用。
 */
export function BadPagination({
  total = 0,
  current,
  defaultCurrent = 1,
  pageSize,
  defaultPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showSizeChanger = false,
  showQuickJumper = false,
  quickJumperTrigger = 'blur',
  showTotal = false,
  disabled = false,
  previousContent,
  nextContent,
  onChange,
  className,
  ...props
}: BadPaginationProps) {
  const jumpId = useId();
  const isComposing = useRef(false);
  // 一份草稿只提交一次，避免 Enter 后紧接着失焦，或业务回调主动移动焦点时重复通知。
  const hasPendingJump = useRef(false);
  // 只保存非受控状态；受控值直接读取 props，不用 Effect 或 render 中的 setState 做同步。
  // 将两项放在同一 state 中，修改条数并回到首页时原子更新，避免中间状态。
  const [internal, setInternal] = useState(() => ({ current: defaultCurrent, pageSize: defaultPageSize }));
  const [jumpValue, setJumpValue] = useState('');
  const [jumpError, setJumpError] = useState('');
  const safeTotal = Number.isFinite(total) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(total))) : 0;
  const actualPageSize = positiveInteger(pageSize ?? internal.pageSize, 10);
  // 无数据也保留第 1 页作为稳定占位，但禁用翻页和跳页。
  const pageCount = Math.max(1, Math.ceil(safeTotal / actualPageSize));
  const actualCurrent = Math.min(positiveInteger(current ?? internal.current, 1), pageCount);
  const range: [number, number] =
    safeTotal === 0
      ? [0, 0]
      : [(actualCurrent - 1) * actualPageSize + 1, Math.min(actualCurrent * actualPageSize, safeTotal)];
  // total 缩小只影响本次合法展示值，不偷偷触发 onChange/请求；受控调用方自行同步页码。
  // 非受控原始页码也不被外部数据变化覆盖，total 恢复后可恢复原页，用户操作才持久更新状态。
  const items = getPageItems(actualCurrent, pageCount);
  const pagingDisabled = disabled || safeTotal === 0;
  const sizes = [
    ...new Set([...pageSizeOptions.filter((size) => Number.isSafeInteger(size) && size > 0), actualPageSize]),
  ].sort((left, right) => left - right);

  /** 所有用户操作共用一个入口：校验、清理草稿、更新非受控状态、通知业务。 */
  function changePage(nextPage: number, nextSize = actualPageSize) {
    if (disabled) return;
    const nextCount = Math.max(1, Math.ceil(safeTotal / nextSize));
    const next = Math.min(Math.max(1, nextPage), nextCount);
    hasPendingJump.current = false;
    setJumpValue('');
    setJumpError('');
    if (next === actualCurrent && nextSize === actualPageSize) return;
    if (current === undefined || pageSize === undefined) {
      setInternal((previous) => ({
        current: current === undefined ? next : previous.current,
        pageSize: pageSize === undefined ? nextSize : previous.pageSize,
      }));
    }
    // 只调用一次，让业务用同一对 page/pageSize 发起请求，避免条数切换导致重复请求。
    onChange?.(next, nextSize);
  }

  function submitJump() {
    if (pagingDisabled || !hasPendingJump.current || isComposing.current) return;
    const draft = jumpValue.trim();
    if (!draft) {
      hasPendingJump.current = false;
      setJumpError('');
      return;
    }
    const next = Number(draft);
    // 不用 parseInt，避免把 2.5、2abc 等部分合法的输入悄悄截断成另一个页码。
    if (!/^\d+$/.test(draft) || !Number.isSafeInteger(next) || next < 1) {
      setJumpError('请输入大于 0 的整数页码');
      return;
    }
    // 超出末页时落到最后一页，保证 onChange 永远收到合法页码。
    changePage(next);
  }

  return (
    <Pagination
      {...props}
      aria-label={props['aria-label'] ?? '分页'}
      aria-disabled={disabled || undefined}
      className={cn('flex-wrap items-center gap-x-4 gap-y-3', className)}
    >
      {showTotal && (
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {typeof showTotal === 'function' ? showTotal(safeTotal, range) : `共 ${safeTotal} 条`}
        </span>
      )}
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          {/* 这里是更新数据的操作而非路由导航，使用 Button 保留原生禁用和键盘语义。 */}
          <Button
            type="button"
            variant="ghost"
            disabled={pagingDisabled || actualCurrent === 1}
            aria-label="上一页"
            onClick={() => changePage(actualCurrent - 1)}
          >
            {/* 仅替换按钮内容，无障碍名称、禁用与翻页行为仍由组件统一管理。 */}
            {previousContent !== undefined ? (
              previousContent
            ) : (
              <>
                <ChevronLeftIcon data-icon="inline-start" />
                <span className="hidden sm:block">上一页</span>
              </>
            )}
          </Button>
        </PaginationItem>
        {items.map((item) => (
          <PaginationItem key={item}>
            {typeof item === 'number' ? (
              <Button
                type="button"
                variant={item === actualCurrent ? 'outline' : 'ghost'}
                size="icon"
                className="w-auto min-w-8 px-2"
                disabled={pagingDisabled}
                aria-label={`第 ${item} 页`}
                aria-current={item === actualCurrent ? 'page' : undefined}
                onClick={() => changePage(item)}
              >
                {item}
              </Button>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <Button
            type="button"
            variant="ghost"
            disabled={pagingDisabled || actualCurrent === pageCount}
            aria-label="下一页"
            onClick={() => changePage(actualCurrent + 1)}
          >
            {nextContent !== undefined ? (
              nextContent
            ) : (
              <>
                <span className="hidden sm:block">下一页</span>
                <ChevronRightIcon data-icon="inline-end" />
              </>
            )}
          </Button>
        </PaginationItem>
      </PaginationContent>
      {showSizeChanger && (
        <NativeSelect
          aria-label="每页条数"
          value={actualPageSize}
          disabled={disabled}
          onChange={(event) => {
            // 条数变化后从第 1 页开始，不保留旧页码或自动计算所谓“相近位置”。
            changePage(1, Number(event.currentTarget.value));
          }}
        >
          {sizes.map((size) => (
            <NativeSelectOption key={size} value={size}>
              {size} 条/页
            </NativeSelectOption>
          ))}
        </NativeSelect>
      )}
      {showQuickJumper && (
        <Field className="w-auto" data-invalid={!!jumpError}>
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <FieldLabel htmlFor={jumpId}>跳至</FieldLabel>
            <Input
              id={jumpId}
              aria-label="跳至页码"
              aria-invalid={!!jumpError}
              aria-describedby={jumpError ? `${jumpId}-error` : undefined}
              title={quickJumperTrigger === 'blur' ? '输入页码后失焦或按 Enter 跳转' : '输入页码后按 Enter 或点击跳转'}
              inputMode="numeric"
              className="w-16"
              placeholder={String(actualCurrent)}
              value={jumpValue}
              disabled={pagingDisabled}
              onChange={(event) => {
                hasPendingJump.current = true;
                setJumpValue(event.currentTarget.value);
                setJumpError('');
              }}
              onBlur={() => {
                // 默认失焦提交；按钮模式不在这里提交，避免点击跳转前的 blur 抢先提交。
                // 组合尚未结束时由 submitJump 拦截，不把未选定的文字当作页码。
                if (quickJumperTrigger === 'blur') submitJump();
              }}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onCompositionEnd={() => {
                isComposing.current = false;
              }}
              onKeyDown={(event) => {
                // 输入法选字也可能使用 Enter；组合期间不提交，避免选字误触发跳页。
                if (event.key === 'Enter' && !isComposing.current && !event.nativeEvent.isComposing) {
                  event.preventDefault(); // 放在表单中时不触发表单提交。
                  submitJump();
                }
              }}
            />
            <span>页</span>
            {quickJumperTrigger === 'button' && (
              <Button type="button" variant="outline" disabled={pagingDisabled} onClick={submitJump}>
                跳转
              </Button>
            )}
          </div>
          {jumpError && <FieldError id={`${jumpId}-error`}>{jumpError}</FieldError>}
        </Field>
      )}
    </Pagination>
  );
}
