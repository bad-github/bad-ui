import type { ReactNode } from 'react';
import { ThemeToggle } from '../../src/components/theme-toggle';
import './preview-frame.css';

/** 仅负责预览区布局；主题状态、事件和根节点样式均由组件库处理。 */
export function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="storybook-preview-frame">
      {/* 此处属于预览 iframe，能直接访问外层 ThemeProvider。 */}
      <div className="storybook-preview-frame__tools" role="group" aria-label="预览工具">
        <ThemeToggle />
      </div>
      {/* 工具区独占一行，不覆盖组件，也不会随组件的禁用状态一起禁用。 */}
      <div className="storybook-preview-frame__content">{children}</div>
    </div>
  );
}
