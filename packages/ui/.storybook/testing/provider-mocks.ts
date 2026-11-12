// 只拦截示例专用键，不影响 Storybook 自身和其他示例的 localStorage。
export function mockStorageFailure(key: string, method: 'getItem' | 'setItem') {
  const original = Object.getOwnPropertyDescriptor(Storage.prototype, method)!;
  Object.defineProperty(Storage.prototype, method, {
    ...original,
    value(this: Storage, ...args: string[]) {
      if (this === localStorage && args[0] === key) throw new DOMException('示例模拟存储被拒绝', 'SecurityError');
      return original.value.apply(this, args);
    },
  });
  return () => Object.defineProperty(Storage.prototype, method, original);
}

/** 可控的系统配色，仅替换配色查询；离开 story 时恢复浏览器原方法。 */
export function mockSystemColor(initialDark: boolean) {
  const original = window.matchMedia;
  const events = new EventTarget();
  let dark = initialDark;
  const media: MediaQueryList = {
    get matches() { return dark; },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
    addListener: (listener) => { if (listener) events.addEventListener('change', listener as EventListener); },
    removeListener: (listener) => { if (listener) events.removeEventListener('change', listener as EventListener); },
  };
  window.matchMedia = (query) => query === media.media ? media : original.call(window, query);
  return {
    setDark(value: boolean) {
      dark = value;
      events.dispatchEvent(new Event('change'));
    },
    restore: () => { window.matchMedia = original; },
  };
}

// storage 事件正常由“其他标签页”产生；此处模拟接收端事件，不声称已打开真实第二标签页。
export function dispatchStorageChange(key: string | null, newValue: string | null) {
  window.dispatchEvent(new StorageEvent('storage', { key, newValue, storageArea: localStorage }));
}
