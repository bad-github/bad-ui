'use client';

import {useCallback, useRef, type CSSProperties} from 'react';
import {geometryFor, useLoadingAnimation} from './animation';
import type {LoadingFrame, LoadingRendererProps} from './types';

// HTML 圆使用固定布局尺寸，每帧通过 transform 移动和缩放，避免频繁修改宽高。
const ballStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  borderRadius: '50%',
  willChange: 'transform',
};

/** HTML 渲染器：用父圆的 overflow:hidden 裁出两球交叠部分。 */
export function HtmlLoading(config: LoadingRendererProps) {
  const {baseRadius, redColor, cyanColor, overlapColor} = config;
  const {width, height, travel, scale} = geometryFor(config);
  const diameter = baseRadius * 2;
  const redBall = useRef<HTMLDivElement>(null);
  const cyanBall = useRef<HTMLDivElement>(null);
  const overlapBall = useRef<HTMLDivElement>(null);

  const draw = useCallback(
    ({cyanX, redX, cyanRadius, redRadius}: LoadingFrame) => {
      // x/y 是球心，translate 需减去布局半径；默认围绕圆心缩放到当前半径。
      if (redBall.current) {
        redBall.current.style.transform =
          `translate3d(${redX - baseRadius}px, ${height / 2 - baseRadius}px, 0) ` + `scale(${redRadius / baseRadius})`;
      }
      if (cyanBall.current) {
        cyanBall.current.style.transform =
          `translate3d(${cyanX - baseRadius}px, ${height / 2 - baseRadius}px, 0) ` +
          `scale(${cyanRadius / baseRadius})`;
      }
      if (overlapBall.current) {
        // 交叠圆受父圆缩放影响，位移和缩放比需换算到青色圆的局部坐标。
        const cyanScale = cyanRadius / baseRadius;
        overlapBall.current.style.transform =
          `translate3d(${(redX - cyanX) / cyanScale}px, 0, 0) ` + `scale(${redRadius / cyanRadius})`;
      }
    },
    [baseRadius, height]
  );
  useLoadingAnimation(config, draw);

  // 外层占据缩放后的尺寸，内部舞台沿用原始坐标，以左上角为原点整体缩放。
  return (
    <div aria-hidden="true" style={{position: 'relative', width: width * scale, height: height * scale}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width,
          height,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}
      >
        <div
          ref={redBall}
          style={{
            ...ballStyle,
            width: diameter,
            height: diameter,
            backgroundColor: redColor,
            transform: `translate3d(${width / 2 + travel - baseRadius}px, ${height / 2 - baseRadius}px, 0)`,
          }}
        />
        <div
          ref={cyanBall}
          style={{
            ...ballStyle,
            width: diameter,
            height: diameter,
            backgroundColor: cyanColor,
            overflow: 'hidden',
            transform: `translate3d(${width / 2 - travel - baseRadius}px, ${height / 2 - baseRadius}px, 0)`,
          }}
        >
          <div
            ref={overlapBall}
            style={{
              ...ballStyle,
              width: diameter,
              height: diameter,
              backgroundColor: overlapColor,
              transform: `translate3d(${2 * travel}px, 0, 0)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
