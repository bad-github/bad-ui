'use client';

import { useRef } from 'react';
import { useConfig } from '../../providers/config-provider';
import { SvgLoading } from './svg-loading';
import { HtmlLoading } from './html-loading';
import type { LoadingRendererProps, TiktokLoadingProps } from './types';

/** 对外入口：根据 type 选择渲染器，并提供统一的配置、容器和文字。 */
export function Base({
  type = 'svg',
  size = 'large',
  durationMs = 2000,
  baseRadius = 9,
  minRadius = 6,
  maxRadius = 12,
  travelRatio = 0.95,
  horizontalPaddingRatio = 0.25,
  verticalPaddingRatio = 0.25,
  redColor = '#fe2c55',
  cyanColor = '#25f4ee',
  overlapColor = '#101010',
  message: messageProp,
  messageClassName,
  messageStyle,
  style,
  ...props
}: TiktokLoadingProps) {
  const configProvider = useConfig();
  const message = messageProp === undefined ? configProvider.locale.tiktokLoading.message : messageProp;
  // 相位属于 Base，渲染器切换或配置变化都不会重置动画进度。
  const angle = useRef(0);
  const config: LoadingRendererProps = {
    size,
    durationMs,
    baseRadius,
    minRadius,
    maxRadius,
    travelRatio,
    horizontalPaddingRatio,
    verticalPaddingRatio,
    redColor,
    cyanColor,
    overlapColor,
    angle,
  };

  // Base 统一处理配置、外层属性和文字，渲染器只负责各自的圆球动画。
  const Renderer = type === 'svg' ? SvgLoading : HtmlLoading;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={configProvider.locale.tiktokLoading.label}
      {...props}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, ...style }}
    >
      <Renderer {...config} />
      {message != null && message !== '' && message !== false && (
        <p className={messageClassName} style={{ fontSize: '12px', color: 'var(--muted-foreground)', ...messageStyle }}>
          {message}
        </p>
      )}
    </div>
  );
}
