'use client';

import { createContext, useContext, useMemo } from 'react';
import { defaultLocale } from './locales';
import { mergeDefined } from './utils';
import type { ConfigContextValue, ConfigProviderProps } from './types';

const DEFAULT_CONFIG: ConfigContextValue = {
  locale: defaultLocale,
  disabled: false,
  popupContainer: undefined,
  pagination: {
    pageSizeOptions: [10, 20, 50, 100],
    showSizeChanger: false,
    showQuickJumper: false,
    quickJumperTrigger: 'blur',
    showTotal: false,
  },
};

// 配置不是必需依赖：未包 Provider 的组件仍可使用默认值，不像主题 Hook 那样抛出错误。
const ConfigContext = createContext<ConfigContextValue>(DEFAULT_CONFIG);
function useConfig() {
  return useContext(ConfigContext);
}

/** 只提供默认配置，不管理输入值、分页、弹层开关，也不写 DOM 或 localStorage。 */
function ConfigProvider({ children, locale, disabled, popupContainer, pagination }: ConfigProviderProps) {
  const parent = useConfig();
  const config = useMemo<ConfigContextValue>(
    () => ({
      disabled: disabled ?? parent.disabled,
      // null 是有效的“恢复 body”指令，只有 undefined 才表示继承。
      popupContainer: popupContainer === undefined ? parent.popupContainer : popupContainer,
      pagination: mergeDefined(parent.pagination, pagination),
      // 逐组件、逐词条合并，避免只改一句文案就丢掉外层的整个语言配置。
      locale: {
        pagination: mergeDefined(parent.locale.pagination, locale?.pagination),
        input: mergeDefined(parent.locale.input, locale?.input),
        dialog: mergeDefined(parent.locale.dialog, locale?.dialog),
        inputPopover: mergeDefined(parent.locale.inputPopover, locale?.inputPopover),
        empty: mergeDefined(parent.locale.empty, locale?.empty),
        loading: mergeDefined(parent.locale.loading, locale?.loading),
        tiktokLoading: mergeDefined(parent.locale.tiktokLoading, locale?.tiktokLoading),
        themeToggle: mergeDefined(parent.locale.themeToggle, locale?.themeToggle),
      },
    }),
    [parent, locale, disabled, popupContainer, pagination]
  );
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export { ConfigProvider, useConfig };
export { zhCN, enUS } from './locales';
export type {
  ConfigProviderProps,
  ConfigContextValue,
  ConfigLocale,
  ConfigLocaleInput,
  PaginationConfig,
  PopupContainer,
} from './types';
