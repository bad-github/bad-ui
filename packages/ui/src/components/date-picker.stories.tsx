import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { DateRange as PickerRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { expect, within, waitFor } from 'storybook/test';
import { shouldRunInteractions } from '../../.storybook/testing/interaction-mode';
import { Calendar } from './calendar';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from './popover';
import { Button } from './button';
import { Input } from './input';
import { Field, FieldLabel, FieldGroup, FieldDescription, FieldError } from './field';
const today = new Date(2026, 10, 13);
const month = new Date(2026, 10, 1);
const display = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : '未选择');
type Options = {
  initial?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  weekends?: boolean;
  booking?: boolean;
  dropdown?: boolean;
  presets?: boolean;
  withTime?: boolean;
  requiredForm?: boolean;
};
function SinglePicker({
  initial = false,
  clearable = false,
  disabled = false,
  weekends = false,
  booking = false,
  dropdown = false,
  presets = false,
  withTime = false,
  requiredForm = false,
}: Options) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(initial ? today : undefined);
  const [time, setTime] = useState('09:00');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  function choose(next: Date | undefined) {
    setDate(next);
    setError(false);
    setSubmitted(false);
    if (next) setOpen(false);
  }
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setError(!date);
        setSubmitted(Boolean(date));
      }}
    >
      <FieldGroup>
        <Field data-invalid={error} data-disabled={disabled}>
          <FieldLabel htmlFor={id}>{requiredForm ? '预约日期（必填）' : '预约日期'}</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              id={id}
              aria-label={`选择预约日期：${date ? display(date) : '请选择日期'}`}
              aria-invalid={error}
              aria-describedby={`${id}-hint`}
              disabled={disabled}
              render={<Button variant="outline" className="w-full justify-start" />}
            >
              <CalendarIcon data-icon="inline-start" aria-hidden="true" />
              <span className="min-w-0 truncate">{date ? display(date) : '请选择日期'}</span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0">
              <PopoverHeader className="px-3 pt-3">
                <PopoverTitle>选择预约日期</PopoverTitle>
                <PopoverDescription>固定以 2026 年 11 月 13 日作为今天。</PopoverDescription>
              </PopoverHeader>
              {presets && (
                <div className="flex flex-wrap gap-2 px-3">
                  <Button variant="outline" size="sm" onClick={() => choose(today)}>
                    今天
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => choose(addDays(today, 1))}>
                    明天
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => choose(addDays(today, 7))}>
                    一周后
                  </Button>
                </div>
              )}
              <Calendar
                mode="single"
                selected={date}
                onSelect={choose}
                defaultMonth={date ?? month}
                today={today}
                locale={zhCN}
                captionLayout={dropdown ? 'dropdown' : 'label'}
                startMonth={dropdown ? new Date(2020, 0, 1) : booking ? month : undefined}
                endMonth={dropdown ? new Date(2030, 11, 1) : booking ? month : undefined}
                disabled={
                  weekends
                    ? { dayOfWeek: [0, 6] }
                    : booking
                      ? [{ before: today }, { after: new Date(2026, 10, 20) }]
                      : undefined
                }
              />
            </PopoverContent>
          </Popover>
          <FieldDescription id={`${id}-hint`}>
            {booking
              ? '仅可选择 11 月 13 至 20 日。'
              : weekends
                ? '周六、周日不可预约。'
                : '选择后自动关闭日历；日期以本地时区显示。'}
          </FieldDescription>
          {error && <FieldError>请选择预约日期</FieldError>}
        </Field>
        {withTime && (
          <Field>
            <FieldLabel htmlFor={`${id}-time`}>预约时间</FieldLabel>
            <Input
              id={`${id}-time`}
              type="time"
              value={time}
              onChange={(event) => setTime(event.currentTarget.value)}
            />
          </Field>
        )}
      </FieldGroup>
      {clearable && (
        <Button variant="outline" disabled={!date} onClick={() => choose(undefined)}>
          清空日期
        </Button>
      )}
      {requiredForm && <Button type="submit">提交预约</Button>}
      <p role="status" aria-label="选择结果" className="text-sm text-muted-foreground">
        {submitted ? '已提交：' : '当前：'}
        {display(date)}
        {withTime && date ? ` ${time}` : ''}
      </p>
    </form>
  );
}
function RangePicker({ presets = false }: { presets?: boolean }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<PickerRange | undefined>();
  const id = useId();
  const value = range?.from
    ? `${display(range.from)} 至 ${range.to ? display(range.to) : '待选择结束日期'}`
    : '请选择日期范围';
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Field>
        <FieldLabel htmlFor={id}>统计日期范围</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            id={id}
            aria-label={`选择日期范围：${value}`}
            render={<Button variant="outline" className="w-full justify-start" />}
          >
            <CalendarIcon data-icon="inline-start" aria-hidden="true" />
            <span className="min-w-0 truncate" title={value}>
              {value}
            </span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto max-w-[calc(100vw-2rem)] p-0">
            <PopoverHeader className="px-3 pt-3">
              <PopoverTitle>选择日期范围</PopoverTitle>
              <PopoverDescription>选择起止日期后点击应用，可跨月选择。</PopoverDescription>
            </PopoverHeader>
            {presets && (
              <div className="flex flex-wrap gap-2 px-3">
                <Button variant="outline" size="sm" onClick={() => setRange({ from: addDays(today, -6), to: today })}>
                  最近 7 天
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRange({ from: month, to: today })}>
                  本月至今
                </Button>
              </div>
            )}
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              defaultMonth={month}
              today={today}
              locale={zhCN}
              numberOfMonths={2}
            />
            <div className="flex flex-wrap justify-end gap-2 border-t p-3">
              <Button variant="outline" size="sm" onClick={() => setRange(undefined)}>
                清空范围
              </Button>
              <Button size="sm" disabled={!range?.from || !range?.to} onClick={() => setOpen(false)}>
                应用范围
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </Field>
      <p role="status" aria-label="范围结果" className="text-sm text-muted-foreground">
        {value}
      </p>
    </div>
  );
}
function dayButton(body: HTMLElement, day: number) {
  const button = body.querySelector<HTMLButtonElement>(`button[data-day="2026/11/${day}"]`);
  if (!button) throw new Error(`未找到 11 月 ${day} 日`);
  return button;
}
const meta = {
  title: 'Components/DatePicker',
  component: SinglePicker,
  args: {
    initial: false,
    clearable: false,
    disabled: false,
    weekends: false,
    booking: false,
    dropdown: false,
    presets: false,
    withTime: false,
    requiredForm: false,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md min-w-0 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '组合 Calendar、Popover、Button 与 Field 的日期选择方案，没有单独的 date-picker 基础组件。示例固定今天为 2026-11-13，选择值由调用方管理；日期不做 UTC 转换。日期时间示例不负责时区或预约业务校验。',
      },
    },
  },
} satisfies Meta<typeof SinglePicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    const trigger = canvas.getByRole('button', { name: /^选择预约日期/ });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog', { name: '选择预约日期' })).toBeVisible());
    await userEvent.click(dayButton(canvasElement.ownerDocument.body, 16));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitForPopupClosed(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('2026-11-16');
  },
};
export const WithDefaultValue: Story = { args: { initial: true } };
export const Clearable: Story = {
  args: { initial: true, clearable: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '清空日期' }));
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('未选择');
    await expect(canvas.getByRole('button', { name: '清空日期' })).toBeDisabled();
  },
};
export const Disabled: Story = { args: { initial: true, disabled: true } };
export const DropdownCaption: Story = { args: { dropdown: true } };
export const DisabledWeekends: Story = { args: { weekends: true } };
export const BookingWindow: Story = {
  args: { booking: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: /^选择预约日期/ }));
    await waitFor(() => expect(dayButton(canvasElement.ownerDocument.body, 12)).toBeDisabled());
    await expect(dayButton(canvasElement.ownerDocument.body, 21)).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await waitForPopupClosed(canvasElement.ownerDocument.body);
  },
};
export const QuickPresets: Story = {
  args: { presets: true },
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: /^选择预约日期/ }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('button', { name: '明天' }));
    await waitForPopupClosed(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('status', { name: '选择结果' })).toHaveTextContent('2026-11-14');
  },
};
export const DateAndTime: Story = { args: { initial: true, withTime: true } };
export const RequiredForm: Story = {
  args: { requiredForm: true },
  play: async ({ canvas, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: '提交预约' }));
    await expect(canvas.getByRole('alert')).toHaveTextContent('请选择预约日期');
    await expect(canvas.getByRole('button', { name: /^选择预约日期/ })).toHaveAttribute('aria-invalid', 'true');
  },
};
export const DateRange: Story = {
  render: () => <RangePicker />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: /^选择日期范围/ }));
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    await userEvent.click(dayButton(canvasElement.ownerDocument.body, 16));
    await userEvent.click(dayButton(canvasElement.ownerDocument.body, 19));
    await userEvent.click(body.getByRole('button', { name: '应用范围' }));
    await waitForPopupClosed(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('status', { name: '范围结果' })).toHaveTextContent('2026-11-16 至 2026-11-19');
  },
};
export const RangePresets: Story = {
  render: () => <RangePicker presets />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    if (!shouldRunInteractions) return;
    await userEvent.click(canvas.getByRole('button', { name: /^选择日期范围/ }));
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('button', { name: '最近 7 天' }));
    await userEvent.click(body.getByRole('button', { name: '应用范围' }));
    await waitForPopupClosed(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('status', { name: '范围结果' })).toHaveTextContent('2026-11-07 至 2026-11-13');
  },
};

async function waitForPopupClosed(element: HTMLElement) {
  await waitFor(() => expect(within(element).queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 5000 });
}
