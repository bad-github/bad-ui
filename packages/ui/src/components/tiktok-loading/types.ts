import type {CSSProperties, HTMLAttributes, ReactNode, RefObject} from 'react';

/**
 * 双球动画配置；半径和位移使用同一套画布坐标，最终显示尺寸由 size 等比缩放。
 * 其余 div 属性（如 id、aria-label、事件处理函数）透传给外层容器。
 */
export interface TiktokLoadingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 渲染方式：svg 使用圆和 clipPath，html 使用 div 和 overflow 裁切。默认 svg。 */
  type?: 'svg' | 'html';
  /** 动画整体缩放：small 75%，middle 100%，large 125%；不缩放文字。默认 large。 */
  size?: 'small' | 'middle' | 'large';
  /** 一次完整往返的时长（毫秒），越小越快；计算时至少取 1。默认 2000。 */
  durationMs?: number;
  /** 大小变化的基准半径，也是 HTML 圆的布局半径。需大于 0，默认 9。 */
  baseRadius?: number;
  /** 收缩阶段的目标半径；建议 0 < minRadius <= baseRadius。默认 6。 */
  minRadius?: number;
  /** 放大阶段的目标半径，同时决定画布和位移；建议 >= baseRadius。默认 12。 */
  maxRadius?: number;
  /** 最大水平位移相对 maxRadius 的比例；越大，两球分离越远。默认 0.95。 */
  travelRatio?: number;
  /** 画布左右每侧留白相对 maxRadius 的比例。默认 0.25。 */
  horizontalPaddingRatio?: number;
  /** 画布上下每侧留白相对 maxRadius 的比例。默认 0.25。 */
  verticalPaddingRatio?: number;
  /** 红色球的填充色，支持 CSS 颜色值。默认 #fe2c55。 */
  redColor?: string;
  /** 青色球的填充色，支持 CSS 颜色值。默认 #25f4ee。 */
  cyanColor?: string;
  /** 两球交叠区域的填充色，支持 CSS 颜色值。默认 #101010。 */
  overlapColor?: string;
  /** 动画下方内容，支持 React 节点；null、空字符串或 false 隐藏。默认“加载中...”。 */
  message?: ReactNode;
  /** 下方文字容器 p 的 CSS 类名。 */
  messageClassName?: string;
  /** 下方文字容器 p 的内联样式，可覆盖默认的 12px 字号和 muted-foreground 颜色。 */
  messageStyle?: CSSProperties;
  /** 外层 div 的 CSS 类名，不直接作用于内部圆球。 */
  className?: string;
  /** 外层 div 的内联样式，可覆盖默认的纵向居中排列。 */
  style?: CSSProperties;
}

/** 两种内部渲染器共用的已解析配置，不包含容器和文字属性。 */
export type LoadingConfig = Required<
  Pick<
    TiktokLoadingProps,
    | 'size'
    | 'durationMs'
    | 'baseRadius'
    | 'minRadius'
    | 'maxRadius'
    | 'travelRatio'
    | 'horizontalPaddingRatio'
    | 'verticalPaddingRatio'
    | 'redColor'
    | 'cyanColor'
    | 'overlapColor'
  >
>;

export interface LoadingRendererProps extends LoadingConfig {
  /** 相位由 Base 持有，切换 SVG/HTML 时继续当前进度。 */
  angle: RefObject<number>;
}

/** 当前帧的球心和半径，使用未缩放的画布坐标。 */
export interface LoadingFrame {
  cyanX: number;
  redX: number;
  cyanRadius: number;
  redRadius: number;
}
