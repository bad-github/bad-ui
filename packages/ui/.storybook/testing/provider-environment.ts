/**
 * Provider 会写入 html 和 localStorage。每个 story 开始前准备独立存储，
 * 并返回清理函数，离开 story 时还原现场，避免影响其他组件的预览。
 * 不清空整个 localStorage，只处理传入的测试专用键。
 */
export function prepareProviderEnvironment(storageKey: string, initialValue?: string) {
  const root = document.documentElement;
  const savedValue = localStorage.getItem(storageKey);
  const savedClass = root.getAttribute('class');
  const savedBaseColor = root.getAttribute('data-base-color');
  const savedTheme = root.getAttribute('data-theme');
  const savedRadius = root.style.getPropertyValue('--radius');
  const savedRadiusPriority = root.style.getPropertyPriority('--radius');

  if (initialValue === undefined) localStorage.removeItem(storageKey);
  else localStorage.setItem(storageKey, initialValue);

  return () => {
    if (savedValue === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, savedValue);
    // 恢复原属性，区分“原来不存在”和“原来为空”，不覆盖 html 上的其他样式。
    for (const [name, value] of [
      ['class', savedClass], ['data-base-color', savedBaseColor], ['data-theme', savedTheme],
    ] as const) {
      if (value === null) root.removeAttribute(name);
      else root.setAttribute(name, value);
    }
    if (savedRadius) root.style.setProperty('--radius', savedRadius, savedRadiusPriority);
    else root.style.removeProperty('--radius');
  };
}
