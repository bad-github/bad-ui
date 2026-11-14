'use client';

import {useEffect} from 'react';
import type {LoadingConfig, LoadingFrame, LoadingRendererProps} from './types';

const sizeScales = {small: 0.75, middle: 1, large: 1.25};

/** 画布覆盖左右最大位移、最大半径和留白，size 只控制最终显示比例。 */
export function geometryFor(config: LoadingConfig) {
  const {maxRadius, travelRatio, horizontalPaddingRatio, verticalPaddingRatio, size} = config;
  const travel = maxRadius * travelRatio;
  const width = 2 * (travel + maxRadius * (1 + horizontalPaddingRatio));
  const height = 2 * maxRadius * (1 + verticalPaddingRatio);
  return {travel, width, height, scale: sizeScales[size]};
}

/** phase 为 [-1, 1]：-1 对应 minRadius，0 对应 baseRadius，1 对应 maxRadius。 */
function radiusAt(phase: number, baseRadius: number, minRadius: number, maxRadius: number) {
  return baseRadius + phase * (phase >= 0 ? maxRadius - baseRadius : baseRadius - minRadius);
}

/** 两种渲染器共用时间推进与几何计算，只在 draw 中执行各自的 DOM 更新。 */
export function useLoadingAnimation(config: LoadingRendererProps, draw: (frame: LoadingFrame) => void) {
  const {durationMs, baseRadius, minRadius, maxRadius, angle} = config;
  const {travel, width} = geometryFor(config);

  useEffect(() => {
    let frameId = 0;
    let lastTime: number | undefined;
    // 尊重系统减少动态效果的偏好：保留加载图形，但不持续运行逐帧动画。
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function tick(time: number) {
      // 按实际帧间隔推进相位，不依赖屏幕刷新率；首帧不推进。
      const elapsed = lastTime === undefined ? 0 : time - lastTime;
      lastTime = time;
      // 相位只需保留一圈，避免组件长时间挂载后数值持续增长。
      angle.current = (angle.current + (elapsed / Math.max(1, durationMs)) * Math.PI * 2) % (Math.PI * 2);

      // cos 控制左右往返，sin 控制半径；两球位置对称，大小以相反相位变化。
      const offset = travel * Math.cos(angle.current);
      const phase = Math.sin(angle.current);
      draw({
        cyanX: width / 2 - offset,
        redX: width / 2 + offset,
        cyanRadius: radiusAt(phase, baseRadius, minRadius, maxRadius),
        redRadius: radiusAt(-phase, baseRadius, minRadius, maxRadius),
      });
      if (!reducedMotion.matches) frameId = requestAnimationFrame(tick);
    }

    function restart() {
      cancelAnimationFrame(frameId);
      // 切换系统偏好时重置计时，避免恢复动画后把暂停时间计入位移。
      lastTime = undefined;
      tick(performance.now());
    }

    // 立即绘制当前相位，切换渲染器时也不必等待下一帧才恢复原来的位置。
    restart();
    reducedMotion.addEventListener('change', restart);
    // 配置变化先取消旧循环；卸载或切换渲染器时取消最后一帧，避免后台继续运行。
    return () => {
      cancelAnimationFrame(frameId);
      reducedMotion.removeEventListener('change', restart);
    };
  }, [durationMs, baseRadius, minRadius, maxRadius, travel, width, angle, draw]);
}
