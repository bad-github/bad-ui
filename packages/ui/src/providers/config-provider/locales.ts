import type { ConfigLocale } from './types';

const zhCN: ConfigLocale = {
  pagination: {
    navigation: '分页',
    previous: '上一页',
    next: '下一页',
    page: (page) => `第 ${page} 页`,
    total: (total) => `共 ${total} 条`,
    pageSize: '每页条数',
    pageSizeOption: (size) => `${size} 条/页`,
    jumpTo: '跳至',
    jumpPage: '跳至页码',
    pageUnit: '页',
    jumpButton: '跳转',
    jumpHintBlur: '输入页码后失焦或按 Enter 跳转',
    jumpHintButton: '输入页码后按 Enter 或点击跳转',
    invalidPage: '请输入大于 0 的整数页码',
  },
  input: { clear: '清空输入', showPassword: '显示密码', hidePassword: '隐藏密码' },
  dialog: { close: '关闭' },
  inputPopover: { label: '输入辅助面板' },
  empty: { text: '暂无数据' },
  loading: { text: '加载中…', label: '加载中' },
  tiktokLoading: { message: '加载中...', label: '加载中' },
  themeToggle: { darkLabel: '切换到深色主题', lightLabel: '切换到浅色主题', title: '切换主题' },
};

const enUS: ConfigLocale = {
  pagination: {
    navigation: 'Pagination',
    previous: 'Previous',
    next: 'Next',
    page: (page) => `Page ${page}`,
    total: (total) => `${total} items`,
    pageSize: 'Page size',
    pageSizeOption: (size) => `${size} / page`,
    jumpTo: 'Go to',
    jumpPage: 'Go to page',
    pageUnit: 'page',
    jumpButton: 'Go',
    jumpHintBlur: 'Enter a page, then blur or press Enter',
    jumpHintButton: 'Enter a page, then press Enter or click Go',
    invalidPage: 'Enter a positive integer page number',
  },
  input: { clear: 'Clear input', showPassword: 'Show password', hidePassword: 'Hide password' },
  dialog: { close: 'Close' },
  inputPopover: { label: 'Input panel' },
  empty: { text: 'No data' },
  loading: { text: 'Loading...', label: 'Loading' },
  tiktokLoading: { message: 'Loading...', label: 'Loading' },
  themeToggle: { darkLabel: 'Switch to dark theme', lightLabel: 'Switch to light theme', title: 'Toggle theme' },
};

// 保持旧组件在没有 Provider 时的默认文案，避免引入配置能力就改变现有界面和可访问名称。
// 应用显式传 locale={zhCN} 或 locale={enUS} 时，获得一致的中文或英文文案。
const defaultLocale: ConfigLocale = {
  ...zhCN,
  input: enUS.input,
  dialog: enUS.dialog,
  empty: enUS.empty,
  loading: enUS.loading,
};

export { zhCN, enUS, defaultLocale };
