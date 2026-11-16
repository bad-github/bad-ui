import type { ReactNode, RefObject } from 'react';

/** 只保存容器或 ref，不在 Provider 渲染期间读取 document，兼容服务端渲染。 */
type PopupContainer = HTMLElement | ShadowRoot | RefObject<HTMLElement | ShadowRoot | null> | null;

type ConfigLocale = {
  pagination: {
    navigation: string;
    previous: string;
    next: string;
    page: (page: number) => string;
    total: (total: number) => string;
    pageSize: string;
    pageSizeOption: (size: number) => string;
    jumpTo: string;
    jumpPage: string;
    pageUnit: string;
    jumpButton: string;
    jumpHintBlur: string;
    jumpHintButton: string;
    invalidPage: string;
  };
  input: { clear: string; showPassword: string; hidePassword: string };
  dialog: { close: string };
  inputPopover: { label: string };
  empty: { text: string };
  loading: { text: string; label: string };
  tiktokLoading: { message: string; label: string };
  themeToggle: { darkLabel: string; lightLabel: string; title: string };
};

/** 可只覆盖某一个组件的某一个词条，其他词条继承最近一层 Provider。 */
type ConfigLocaleInput = { [Key in keyof ConfigLocale]?: Partial<ConfigLocale[Key]> };

type PaginationConfig = {
  pageSizeOptions: readonly number[];
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  quickJumperTrigger: 'blur' | 'button';
  showTotal: boolean | ((total: number, range: [number, number]) => ReactNode);
};

type ConfigContextValue = {
  locale: ConfigLocale;
  disabled: boolean;
  popupContainer: PopupContainer | undefined;
  pagination: PaginationConfig;
};

type ConfigProviderProps = {
  children: ReactNode;
  locale?: ConfigLocaleInput;
  /** 默认禁用自定义交互组件，组件自己的 disabled={false} 可覆盖。 */
  disabled?: boolean;
  /** undefined 继承上层；null 明确使用底层默认 body，不能用 ?? 合并。 */
  popupContainer?: PopupContainer;
  /** 只配置默认外观与选项，不保存 current/pageSize 等业务状态。 */
  pagination?: Partial<PaginationConfig>;
};

export type {
  PopupContainer,
  ConfigLocale,
  ConfigLocaleInput,
  PaginationConfig,
  ConfigContextValue,
  ConfigProviderProps,
};
