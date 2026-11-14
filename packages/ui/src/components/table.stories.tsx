import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './table';
function Example({
  empty = false,
  footer = false,
  selected = false,
  wide = false,
}: {
  empty?: boolean;
  footer?: boolean;
  selected?: boolean;
  wide?: boolean;
}) {
  return (
    <div role="region" aria-label="账单表格滚动区" tabIndex={0}>
      <Table tabIndex={wide ? 0 : undefined} className={wide ? 'min-w-[700px]' : undefined}>
        <TableCaption>最近的项目账单</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">编号</TableHead>
            <TableHead scope="col">状态</TableHead>
            <TableHead scope="col" className="text-right">
              金额
            </TableHead>
            {wide && <TableHead scope="col">备注</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {empty ? (
            <TableRow>
              <TableCell colSpan={wide ? 4 : 3} className="text-center">
                暂无账单
              </TableCell>
            </TableRow>
          ) : (
            [1, 2, 3].map((n) => (
              <TableRow key={n} data-state={selected && n === 2 ? 'selected' : undefined}>
                <TableCell>INV-00{n}</TableCell>
                <TableCell>{n === 3 ? '待支付' : '已支付'}</TableCell>
                <TableCell className="text-right">¥100.00</TableCell>
                {wide && <TableCell>项目文档与组件服务费用</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
        {footer && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>合计</TableCell>
              <TableCell className="text-right">¥300.00</TableCell>
              {wide && <TableCell />}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
const meta = {
  title: 'Components/Table',
  component: Example,
  args: { empty: false, footer: false, selected: false, wide: false },
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
          '语义化表格，包含标题、表头、表体与汇总行。宽表由容器横向滚动；选中行示例仅展示样式，不实现行选择。排序、筛选和分页由业务逻辑管理。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithFooter: Story = { args: { footer: true } };
export const Empty: Story = { args: { empty: true } };
export const SelectedRow: Story = { args: { selected: true } };
export const WideTable: Story = { args: { wide: true } };
