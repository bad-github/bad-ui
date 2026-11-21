import { flushSync } from 'react-dom';

export type ThemeToggleAnimation = 'none' | 'circle' | 'dots';

const TRANSITION_ATTRIBUTE = 'data-theme-toggle-transition';

/** 动画只负责遮罩，主题状态与持久化仍交给 ThemeProvider。 */
export function animateThemeChange(button: HTMLElement, animation: ThemeToggleAnimation, toggle: () => void) {
  const root = document.documentElement;
  if (root.hasAttribute(TRANSITION_ATTRIBUTE)) return;
  if (animation === 'none' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) {
    toggle();
    return;
  }

  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  const commit = () => flushSync(toggle);

  if (animation === 'circle') {
    if (!document.startViewTransition) {
      toggle();
      return;
    }
    root.setAttribute(TRANSITION_ATTRIBUTE, 'circle');
    const transition = document.startViewTransition(commit);
    void transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 1000, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        );
      })
      .catch(() => {});
    void transition.finished.catch(() => {}).finally(() => root.removeAttribute(TRANSITION_ATTRIBUTE));
    return;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    toggle();
    return;
  }
  // 使用当前主题背景作为过渡幕布，适配使用方的配色令牌。
  const color =
    getComputedStyle(root).getPropertyValue('--background').trim() || getComputedStyle(document.body).backgroundColor;
  const spacing = width < 700 ? 18 : 24;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.className = 'theme-toggle__dots';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  context.scale(scale, scale);
  root.setAttribute(TRANSITION_ATTRIBUTE, 'dots');
  document.body.appendChild(canvas);

  const dots: { x: number; y: number; distance: number }[] = [];
  for (let top = spacing / 2; top < height + spacing; top += spacing) {
    for (let left = spacing / 2; left < width + spacing; left += spacing) {
      dots.push({ x: left, y: top, distance: Math.hypot(left - x, top - y) / radius });
    }
  }

  let committed = false;
  let frame = 0;
  const start = performance.now();
  const halfDuration = 520;
  const cleanup = () => {
    cancelAnimationFrame(frame);
    clearTimeout(timeout);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    canvas.remove();
    root.removeAttribute(TRANSITION_ATTRIBUTE);
  };
  const finish = () => {
    try {
      if (!committed) {
        committed = true;
        commit();
      }
    } finally {
      cleanup();
    }
  };
  const onVisibilityChange = () => {
    if (document.hidden) finish();
  };
  // 即使浏览器暂停动画帧，也不留下遮罩或丢失本次切换。
  const timeout = window.setTimeout(finish, 1500);
  document.addEventListener('visibilitychange', onVisibilityChange);
  const draw = (now: number) => {
    const elapsed = now - start;
    if (elapsed >= halfDuration * 2) {
      finish();
      return;
    }
    if (elapsed >= halfDuration && !committed) {
      committed = true;
      commit();
    }
    const revealing = elapsed >= halfDuration;
    const progress = revealing ? (elapsed - halfDuration) / halfDuration : elapsed / halfDuration;
    context.clearRect(0, 0, width, height);
    context.fillStyle = color;
    context.beginPath();
    for (const dot of dots) {
      // 两阶段的波前都从按钮向外推进：先铺开幕布，再从中心向外揭示新主题。
      const wave = Math.min(1, Math.max(0, (progress * 1.5 - dot.distance) / 0.5));
      const size = (revealing ? 1 - wave : wave) * spacing * 0.72;
      if (size < 0.4) continue;
      context.moveTo(dot.x + size, dot.y);
      context.arc(dot.x, dot.y, size, 0, Math.PI * 2);
    }
    context.fill();
    frame = requestAnimationFrame(draw);
  };
  frame = requestAnimationFrame(draw);
}
