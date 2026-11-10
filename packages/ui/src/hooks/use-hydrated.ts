'use client';

import { useSyncExternalStore } from 'react';

// 水合完成与否由 React 的服务端快照机制区分，无需 effect 中同步设置状态。
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/** 服务端及客户端水合首帧返回 false，之后返回 true；纯客户端渲染直接返回 true。 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
