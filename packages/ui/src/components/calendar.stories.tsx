import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { zhCN, enUS } from 'date-fns/locale';
import type { DateRange as CalendarRange } from 'react-day-picker';
import { expect } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Calendar } from './calendar';
import { Button } from './button';
const month = new Date(2026, 10, 1);
const today = new Date(2026, 10, 13);
type DisplayOptions = Pick<
  ComponentProps<typeof Calendar>,
  'showWeekNumber' | 'showOutsideDays' | 'fixedWeeks' | 'buttonVariant'
>;
function Single({
  disabled = false,
  dropdown = false,
  empty = false,
  bookingWindow = false,
  booked = false,
  english = false,
  ...display
}: DisplayOptions & {
  disabled?: boolean;
  dropdown?: boolean;
  empty?: boolean;
  bookingWindow?: boolean;
  booked?: boolean;
  english?: boolean;
}) {
  const [date, setDate] = useState<Date | undefined>(empty ? undefined : today);
  return (
    <div className="flex flex-col gap-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={month}
        today={today}
        locale={english ? enUS : zhCN}
        labels={
          english
            ? {
                labelDayButton: (date, modifiers) =>
                  `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}${modifiers.selected ? ', selected' : ''}`,
              }
            : undefined
        }
        disabled={
          disabled
            ? { dayOfWeek: [0, 6] }
            : bookingWindow
              ? [{ before: today }, { after: new Date(2026, 10, 20) }]
              : booked
                ? [new Date(2026, 10, 16), new Date(2026, 10, 18)]
                : undefined
        }
        startMonth={bookingWindow ? month : undefined}
        endMonth={bookingWindow ? month : undefined}
        {...display}
        captionLayout={dropdown ? 'dropdown' : 'label'}
      />
      <p role="status" aria-label="选择结果">
        选择：{date ? `${date.getMonth() + 1}月${date.getDate()}日` : '无'}
      </p>
    </div>
  );
}
function Range({ constrained = false }: { constrained?: boolean }) {
  const [range, setRange] = useState<CalendarRange | undefined>(
    constrained
      ? undefined
      : {
          from: new Date(2026, 10, 13),
          to: new Date(2026, 10, 16),
        }
  );
  return (
    <div className="flex flex-col gap-4">
      {constrained && (
        <p className="text-sm text-muted-foreground">至少 2 晚、最多 6 晚；周末不可选，跨过周末会重置范围。</p>
      )}
      <Calendar
        mode="range"
        defaultMonth={month}
        today={today}
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
        locale={zhCN}
        min={constrained ? 2 : undefined}
        max={constrained ? 6 : undefined}
        disabled={constrained ? { dayOfWeek: [0, 6] } : undefined}
        excludeDisabled={constrained}
      />
      <p role="status" aria-label="范围结果">
        {range?.from?.toLocaleDateString('zh-CN') ?? '未选择'} 至{' '}
        {range?.to?.toLocaleDateString('zh-CN') ?? '待选择结束日期'}
      </p>
    </div>
  );
}
function Multi({ limited = false }: { limited?: boolean }) {
  const [dates, setDates] = useState<Date[] | undefined>([new Date(2026, 10, 13), new Date(2026, 10, 16)]);
  return (
    <div className="flex flex-col gap-4">
      {limited && <p className="text-sm text-muted-foreground">最多选择 3 个日期；再次点击已选日期可取消。</p>}
      <Calendar
        mode="multiple"
        defaultMonth={month}
        today={today}
        selected={dates}
        onSelect={setDates}
        max={limited ? 3 : undefined}
        disabled={
          limited && dates?.length === 3
            ? (day) =>
                !dates.some(
                  (selected) =>
                    selected.getFullYear() === day.getFullYear() &&
                    selected.getMonth() === day.getMonth() &&
                    selected.getDate() === day.getDate()
                )
            : undefined
        }
        locale={zhCN}
      />
      <p role="status" aria-label="多选结果">
        已选 {dates?.length ?? 0} 项
      </p>
    </div>
  );
}
const meta = {
  title: 'Components/Calendar',
  component: Single,
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '基于 React DayPicker。示例固定展示 2026 年 11 月，以 11 月 13 日作为今天。覆盖单选、多选、范围、日期约束、周数、本地化和受控月份；各示例独立管理选择状态。',
      },
    },
  },
} satisfies Meta<typeof Single>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const day = canvasElement.querySelector<HTMLButtonElement>('button[data-day="2026/11/16"]');
    if (!day) throw new Error('未找到 11 月 16 日');
    await userEvent.click(day);
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('11月16日');
  },
};
export const DateRange: Story = { render: () => <Range /> };
export const Multiple: Story = { render: () => <Multi /> };
export const DisabledWeekends: Story = { args: { disabled: true } };
export const DropdownCaption: Story = { args: { dropdown: true } };

function RequiredExample() {
  const [date, setDate] = useState(today);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">必须保留一个日期，点击已选日期不会取消选择。</p>
      <Calendar
        mode="single"
        required
        selected={date}
        onSelect={setDate}
        defaultMonth={month}
        today={today}
        locale={zhCN}
      />
      <p role="status" aria-label="必选结果">
        {date.toLocaleDateString('zh-CN')}
      </p>
    </div>
  );
}
function ControlledMonthExample() {
  const [visibleMonth, setVisibleMonth] = useState(month);
  const [date, setDate] = useState<Date | undefined>(today);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setVisibleMonth(new Date(2026, 9, 1))}>
          查看十月
        </Button>
        <Button variant="outline" size="sm" onClick={() => setVisibleMonth(month)}>
          回到十一月
        </Button>
      </div>
      <Calendar
        mode="single"
        month={visibleMonth}
        onMonthChange={setVisibleMonth}
        selected={date}
        onSelect={setDate}
        today={today}
        locale={zhCN}
        startMonth={new Date(2026, 0, 1)}
        endMonth={new Date(2026, 11, 1)}
      />
      <p role="status" aria-label="月份结果">
        当前月份：{visibleMonth.getMonth() + 1}月
      </p>
    </div>
  );
}
function getDay(element: HTMLElement, day: number) {
  const button = element.querySelector<HTMLButtonElement>(`button[data-day="2026/11/${day}"]`);
  if (!button) throw new Error(`未找到 11 月 ${day} 日`);
  return button;
}
export const EmptySelection: Story = {
  args: { empty: true },
  parameters: { docs: { description: { story: '初始不选择日期，点击后显示结果，再次点击可清空。' } } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('无');
    await userEvent.click(getDay(canvasElement, 16));
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('11月16日');
    await userEvent.click(getDay(canvasElement, 16));
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('无');
  },
};
export const RequiredSelection: Story = {
  render: () => <RequiredExample />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(getDay(canvasElement, 13));
    await expect(canvas.getByRole('status', { name: '必选结果' })).toHaveTextContent('2026/11/13');
  },
};
export const BookingWindow: Story = {
  args: { bookingWindow: true },
  parameters: { docs: { description: { story: '仅允许选择 11 月 13 至 20 日（含首尾），同时限制月份导航。' } } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await expect(getDay(canvasElement, 12)).toBeDisabled();
    await expect(getDay(canvasElement, 21)).toBeDisabled();
    await userEvent.click(getDay(canvasElement, 20));
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('11月20日');
  },
};
export const DisabledDates: Story = {
  args: { booked: true },
  parameters: { docs: { description: { story: '11 月 16、18 日为已预订日期，禁止选择；其他日期仍可选择。' } } },
};
export const MultipleLimit: Story = {
  render: () => <Multi limited />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(getDay(canvasElement, 17));
    await expect(canvas.getByRole('status', { name: '多选结果' })).toHaveTextContent('已选 3 项');
    await expect(getDay(canvasElement, 18)).toBeDisabled();
    await userEvent.click(getDay(canvasElement, 17));
    await expect(getDay(canvasElement, 18)).toBeEnabled();
    await expect(canvas.getByRole('status', { name: '多选结果' })).toHaveTextContent('已选 2 项');
  },
};
export const ConstrainedRange: Story = {
  render: () => <Range constrained />,
  parameters: {
    docs: {
      description: {
        story:
          '范围 min / max 按间隔晚数计算，不是端点日期数量。周末禁用，excludeDisabled 阻止选择跨越周末的完整范围。',
      },
    },
  },
};
export const WeekNumbers: Story = {
  args: { showWeekNumber: true },
  parameters: { docs: { description: { story: '显示周数；当前中文 locale 以周一作为每周起点。' } } },
};
export const OutsideDaysHidden: Story = { args: { showOutsideDays: false } };
export const FixedWeeks: Story = {
  args: { fixedWeeks: true },
  parameters: { docs: { description: { story: '始终显示六行日期，切换月份时保持网格高度。' } } },
};
export const English: Story = { args: { english: true } };
export const OutlineNavigation: Story = { args: { buttonVariant: 'outline' } };
export const ControlledMonth: Story = {
  render: () => <ControlledMonthExample />,
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '查看十月' }));
    await expect(canvas.getByRole('status', { name: '月份结果' })).toHaveTextContent('10月');
    await userEvent.click(canvas.getByRole('button', { name: '回到十一月' }));
    await expect(canvas.getByRole('status', { name: '月份结果' })).toHaveTextContent('11月');
  },
};
