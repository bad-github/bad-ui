'use client';
import { LoadingIcon } from './loading-icon';
import type * as React from 'react';
import { cn } from 'cn';

type TProps = {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: 'page' | 'component' | 'area';
  text?: React.ReactNode;
  showText?: boolean;
  size?: 'default' | 'sm' | 'xs';
};

type TLoadingProps = Pick<TProps, 'type' | 'text' | 'showText' | 'size'>;
type TSizeProps = Pick<TProps, 'size'>;

const SizeMap = {
  xs: 'size-4',
  sm: 'size-6',
  default: 'size-8',
};

const LoadingComponent = ({ size = 'default' }: TSizeProps) => {
  const bars = Array.from({ length: 12 }, (_, i) => {
    const rotate = i * 30; // 360 / 12
    const opacity = Number((1 - (i * 0.9) / 11).toFixed(3)); // 1 到 0.1 递减
    return (
      <div key={i} style={{ transform: `rotate(${rotate}deg)`, opacity }} className="absolute inset-0">
        <div className="mx-auto h-[25%] w-0.5 rounded-sm bg-primary"></div>
      </div>
    );
  });

  return (
    <div
      className={cn('bad-ui-loading-component relative', SizeMap[size])}
      role="status"
      aria-live="polite"
      aria-label="loading"
    >
      {bars}
    </div>
  );
};

const LoadingArea = ({ size = 'default' }: TSizeProps) => {
  return <LoadingIcon role="status" aria-label="Loading" className={cn('animate-spin fill-primary', SizeMap[size])} />;
};

const LoadingPage = ({ size = 'default' }: TSizeProps) => {
  const className = cn('bad-ui-loading-page rounded-full bg-primary', SizeMap[size]);
  return (
    <div className="flex gap-2" role="status" aria-label="Loading">
      <span className={className} style={{ animationDelay: '-0.32s' }}></span>
      <span className={className} style={{ animationDelay: '-0.16s' }}></span>
      <span className={className}></span>
    </div>
  );
};

const Loading = (props: TLoadingProps) => {
  const { type = 'area', text = 'Loading...', showText = true, size } = props;
  const Component = type === 'page' ? LoadingPage : type === 'component' ? LoadingComponent : LoadingArea;

  return (
    <div className="inline-flex flex-col items-center gap-2 text-xs text-muted-foreground">
      <Component size={size} />
      {showText && text}
    </div>
  );
};

const LoadingOverlay = (props: TProps) => {
  const {
    className,
    style,
    loading = false,
    children,
    text = 'Loading...',
    type = 'area',
    showText = true,
    size = 'default',
  } = props;

  return (
    <div className={cn('relative', className)} style={style}>
      {/*
       * 保持内容挂载，避免切换 loading 时丢失子组件状态。
       * inert 在加载时统一禁用内容的鼠标点击和键盘聚焦（包括 Tab 导航），
       * 并将内容移出无障碍树；aria-busy 标记该区域正在更新。
       * contents 不生成额外的布局盒，尽量保持原有布局。
       */}
      <div className="contents" inert={loading} aria-busy={loading}>
        {children}
      </div>
      {/* 加载提示放在 inert 和 aria-busy 区域之外，避免被禁用或延迟播报。 */}
      {loading && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-background/70 select-none">
          <Loading type={type} text={text} showText={showText} size={size} />
        </div>
      )}
    </div>
  );
};

export { LoadingOverlay, Loading, LoadingPage, LoadingArea, LoadingComponent };
