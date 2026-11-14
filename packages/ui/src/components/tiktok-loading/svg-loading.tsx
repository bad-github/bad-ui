'use client';

import {useCallback, useId, useRef} from 'react';
import {geometryFor, useLoadingAnimation} from './animation';
import type {LoadingFrame, LoadingRendererProps} from './types';

/** SVG 渲染器：用圆形 clipPath 裁出两球交叠部分。 */
export function SvgLoading(config: LoadingRendererProps) {
  const {baseRadius, redColor, cyanColor, overlapColor} = config;
  const {width, height, travel, scale} = geometryFor(config);
  // 每个实例使用独立 ID，防止多实例之间引用到其他 SVG 的裁切区域。
  const clipId = `tiktok-cyan-${useId().replace(/:/g, '')}`;
  const redCircle = useRef<SVGCircleElement>(null);
  const cyanCircle = useRef<SVGCircleElement>(null);
  const cyanClip = useRef<SVGCircleElement>(null);
  const overlapCircle = useRef<SVGCircleElement>(null);

  const draw = useCallback(({cyanX, redX, cyanRadius, redRadius}: LoadingFrame) => {
    // 裁切圆与青色球同步，交叠圆与红色球同步，裁切后只留下相交部分。
    for (const circle of [cyanCircle.current, cyanClip.current]) {
      circle?.setAttribute('cx', String(cyanX));
      circle?.setAttribute('r', String(cyanRadius));
    }
    for (const circle of [redCircle.current, overlapCircle.current]) {
      circle?.setAttribute('cx', String(redX));
      circle?.setAttribute('r', String(redRadius));
    }
  }, []);
  useLoadingAnimation(config, draw);

  // viewBox 保持原始坐标，实际宽高乘以 size 的缩放系数。
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      style={{width: width * scale, height: height * scale, overflow: 'visible'}}
    >
      <defs>
        <clipPath id={clipId}>
          <circle ref={cyanClip} cx={width / 2 - travel} cy={height / 2} r={baseRadius} />
        </clipPath>
      </defs>
      <circle ref={redCircle} cx={width / 2 + travel} cy={height / 2} r={baseRadius} fill={redColor} />
      <circle ref={cyanCircle} cx={width / 2 - travel} cy={height / 2} r={baseRadius} fill={cyanColor} />
      <circle
        ref={overlapCircle}
        cx={width / 2 + travel}
        cy={height / 2}
        r={baseRadius}
        fill={overlapColor}
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}
