# ConfigProvider

可选的自定义组件默认配置。原始 shadcn 组件不读取此配置，也没有被修改；不包 Provider 时，自定义组件保留原来的默认行为。

```tsx
import { ConfigProvider, zhCN, BadInput, BadPagination } from '@badnpm/ui';

<ConfigProvider
  locale={zhCN}
  pagination={{
    showTotal: true,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: [10, 20, 50],
  }}
>
  <BadInput allowClear />
  <BadPagination total={200} />
</ConfigProvider>;
```

## 配置项

| 属性             | 用途                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| `locale`         | 文案配置，提供 `zhCN` / `enUS`，也可仅传某个组件的某个词条                                     |
| `disabled`       | 自定义交互组件的默认禁用状态，默认为 `false`                                                   |
| `popupContainer` | BadDialogContent、BadTooltip、InputPopover 的默认弹层容器，支持 DOM、ShadowRoot、ref 或 `null` |
| `pagination`     | BadPagination 的条数选项、总数、条数选择器、跳页输入显示配置，以及跳页触发方式                 |

配置优先级：**组件显式 props → 最近一层 Provider → 内置默认值**。嵌套 Provider 逐字段继承，语言配置还会逐词条合并；`undefined` 表示继承，`false`、空字符串和空数组均是有效覆盖。

```tsx
<ConfigProvider locale={enUS} disabled pagination={{ showTotal: true }}>
  <BadInput /> {/* 默认禁用 */}
  <ConfigProvider locale={{ input: { clear: 'Remove' } }} disabled={false}>
    <BadInput allowClear /> {/* 可操作；清空文案为 Remove，其余仍为英文 */}
    <BadPagination total={100} showTotal={false} /> {/* 组件 props 覆盖 Provider */}
  </ConfigProvider>
</ConfigProvider>
```

原有组件文案有中英文混用，为兼容旧行为，未指定 `locale` 时保留这些默认值。希望统一语言时显式传入完整预设。应用自己传入的 `children`、占位符、自定义内容不会自动翻译。

## 弹层容器

```tsx
const containerRef = useRef<HTMLDivElement>(null);

return (
  <>
    <div ref={containerRef} />
    <ConfigProvider popupContainer={containerRef}>
      {/* BadTooltip / BadDialogContent / InputPopover 默认挂载到上述节点 */}
      <BadTooltip trigger={{ children: '触发元素' }} content={{ children: '提示' }} />
      <BadTooltip trigger={{ children: '挂载到 body' }} content={{ children: '提示' }} container={null} />
    </ConfigProvider>
  </>
);
```

容器的 `undefined` 表示继承，`null` 明确恢复底层默认 `body`，也可在嵌套 Provider 上设置。Provider 不读取 `document`；首次渲染就使用 ref 时，请传 ref 本身，而非尚未赋值的 `ref.current`。容器只改变挂载位置，Dialog 的 fixed 定位规则保持不变。

## 接入范围

- 禁用状态：BadButton、BadInput、CompositionInput、BadPagination、BadTooltip、InputPopover、ThemeToggle。组件可通过 `disabled={false}` 覆盖全局禁用；BadButton 的 `loading` 仍会强制禁用。
- 默认文案：BadInput、BadPagination、BadDialogContent、InputPopover、BadEmpty、LoadingOverlay / Loading、TiktokLoading、ThemeToggle。组件已有的文案 props 优先。
- HighlightKeyword 等没有通用配置需求的展示组件无需读取 Context。ThemeToggleBackup 保留原实现。

Provider 不管理输入值、当前页、弹层开关、主题状态，也不写 DOM 或 localStorage。新增自定义组件时，通过 `useConfig()` 读取相关默认值；不需要用配置的组件无需接入。原始 Button、Input、Dialog 等基础组件保持独立。

Storybook 的 `Providers/ConfigProvider` 可操作验证语言切换、默认禁用、嵌套覆盖及弹层挂载容器。
