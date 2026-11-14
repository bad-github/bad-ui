import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fragment, useState } from 'react';
import type { MouseEvent } from 'react';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination';

function Example({ initial = 2, total = 5, compact = false }: { initial?: number; total?: number; compact?: boolean }) {
  const [page, setPage] = useState(initial);
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    (n) => total <= 5 || n === 1 || n === total || Math.abs(n - page) <= 1
  );
  const move = (next: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (next >= 1 && next <= total) setPage(next);
  };
  return (
    <div className="flex flex-col gap-4">
      <Pagination aria-label="示例分页">
        <PaginationContent className="flex-wrap justify-center">
          <PaginationItem>
            <PaginationPrevious
              role="link"
              text="上一页"
              aria-label="上一页"
              href={page > 1 ? `?page=${page - 1}` : undefined}
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              onClick={move(page - 1)}
            />
          </PaginationItem>
          {!compact &&
            pages.map((n, index) => (
              <Fragment key={n}>
                {index > 0 && n - pages[index - 1]! > 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    role="link"
                    href={`?page=${n}`}
                    aria-label={`第 ${n} 页`}
                    isActive={page === n}
                    onClick={move(n)}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              </Fragment>
            ))}
          <PaginationItem>
            <PaginationNext
              role="link"
              text="下一页"
              aria-label="下一页"
              href={page < total ? `?page=${page + 1}` : undefined}
              aria-disabled={page === total}
              tabIndex={page === total ? -1 : undefined}
              onClick={move(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p role="status" className="text-center text-sm">
        第 {page} / {total} 页
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Pagination',
  component: Example,
  args: { initial: 2, total: 5, compact: false },
  argTypes: { initial: { control: false }, total: { control: false } },
  render: (args) => <Example key={`${args.initial}-${args.total}`} {...args} />,
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '链接式分页，包含当前页、上一页、下一页和省略号。示例阻止链接跳转并更新本地页码；真实项目可将 href 接到路由。边界项移除 href、退出 Tab 顺序并设置 aria-disabled，事件处理同时阻止越界。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('link', { name: '下一页' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('第 3 / 5 页');
    await expect(canvas.getByRole('link', { name: '第 3 页' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('link', { name: '上一页' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('第 2 / 5 页');
  },
};
export const FirstPage: Story = { args: { initial: 1 } };
export const LastPage: Story = { args: { initial: 5 } };
export const ManyPages: Story = { args: { initial: 6, total: 12 } };
export const Compact: Story = { args: { compact: true } };
export const SinglePage: Story = { args: { initial: 1, total: 1 } };
