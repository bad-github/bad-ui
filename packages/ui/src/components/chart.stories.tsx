import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from './chart';
const config = {
  visits: { label: '访问量', color: 'var(--chart-1)' },
  downloads: { label: '下载量', color: 'var(--chart-2)' },
} satisfies ChartConfig;
const data = [
  { month: '一月', visits: 120, downloads: 80 },
  { month: '二月', visits: 180, downloads: 100 },
  { month: '三月', visits: 150, downloads: 110 },
  { month: '四月', visits: 240, downloads: 160 },
];
function Example({
  line = false,
  empty = false,
  stacked = false,
  indicator = 'dot',
}: {
  line?: boolean;
  empty?: boolean;
  stacked?: boolean;
  indicator?: 'dot' | 'line' | 'dashed';
}) {
  const values = empty ? [] : data;
  return (
    <figure className="flex flex-col gap-4">
      <figcaption>组件库访问与下载（示例数据）</figcaption>
      <ChartContainer config={config} className="h-64 w-full">
        {line ? (
          <LineChart data={values} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" />
            <ChartTooltip content={<ChartTooltipContent indicator={indicator} />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line dataKey="visits" stroke="var(--color-visits)" isAnimationActive={false} />
            <Line dataKey="downloads" stroke="var(--color-downloads)" isAnimationActive={false} />
          </LineChart>
        ) : (
          <BarChart data={values} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" />
            <ChartTooltip content={<ChartTooltipContent indicator={indicator} />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="visits"
              fill="var(--color-visits)"
              stackId={stacked ? 'total' : undefined}
              isAnimationActive={false}
            />
            <Bar
              dataKey="downloads"
              fill="var(--color-downloads)"
              stackId={stacked ? 'total' : undefined}
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ChartContainer>
      {empty && <p role="status">暂无统计数据</p>}
      <p className="text-sm text-muted-foreground">
        {empty ? '尚无可展示数据。' : '一月至四月访问量：120、180、150、240；下载量：80、100、110、160。'}
      </p>
    </figure>
  );
}
const meta = {
  title: 'Components/Chart',
  component: Example,
  args: { line: false, empty: false, stacked: false, indicator: 'dot' },
  argTypes: { indicator: { control: 'select', options: ['dot', 'line', 'dashed'] } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '基于 Recharts。ChartConfig 管理标签与配色，Tooltip 和 Legend 必须位于 ChartContainer 内。示例关闭动画，提供文字数据说明；悬停或通过键盘探索图表可查看提示。',
      },
    },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Lines: Story = { args: { line: true } };
export const Stacked: Story = { args: { stacked: true } };
export const DashedIndicator: Story = { args: { indicator: 'dashed' } };
export const Empty: Story = { args: { empty: true } };
