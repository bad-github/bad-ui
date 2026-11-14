'use client';

import type { Input as InputPrimitive } from '@base-ui/react/input';
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState, type ComponentProps } from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group';
import { Spinner } from './spinner';

export type BadInputProps = Omit<ComponentProps<typeof InputGroupInput>, 'ref'> &
  Pick<InputPrimitive.Props, 'onValueChange'> & {
    /** 显示加载图标并隐藏其他右侧操作，不自动禁用输入。 */
    loading?: boolean;
    /** 非密码输入有值时显示清空按钮；disabled、readOnly 时不能清空。 */
    allowClear?: boolean;
    /** 密码显隐的受控状态；不传时由组件内部管理。仅 type="password" 时生效。 */
    showPassword?: boolean;
    /** 用户切换密码显隐时通知，受控使用时需由调用方更新 showPassword。 */
    onShowPasswordChange?: (visible: boolean) => void;
  };

/** ref 暴露操作方法和密码显隐状态，不直接暴露输入框 DOM。 */
export type BadInputHandle = {
  focus: () => void;
  select: () => void;
  isPasswordVisible: boolean;
};

export const BadInput = forwardRef<BadInputHandle, BadInputProps>(function BadInput(
  {
    loading = false,
    allowClear = false,
    type,
    className,
    style,
    value,
    defaultValue,
    disabled,
    readOnly,
    onValueChange,
    showPassword,
    onShowPasswordChange,
    ...props
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  // localValue 只用于判断非受控输入是否显示清空按钮，不作为 Input 的 value。
  const [localValue, setLocalValue] = useState(defaultValue ?? '');
  const [localShowPassword, setLocalShowPassword] = useState(false);
  const isPasswordVisible = showPassword ?? localShowPassword;
  const currentValue = value ?? localValue;
  const showClear = allowClear && String(currentValue).length > 0;

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      select: () => inputRef.current?.select(),
      isPasswordVisible,
    }),
    [isPasswordVisible]
  );

  const handleClear = () => {
    const input = inputRef.current;
    if (!input || disabled || readOnly) return;

    // 通过原生 setter 和 input 事件清空，使 React onChange 与 Base UI onValueChange
    // 收到真实输入事件，不伪造只有 target.value 的 React.ChangeEvent。
    const prototype = input.ownerDocument.defaultView?.HTMLInputElement.prototype;
    const setter = prototype && Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    const EventConstructor = input.ownerDocument.defaultView?.Event;
    if (!setter || !EventConstructor) return;
    setter.call(input, '');
    input.dispatchEvent(new EventConstructor('input', { bubbles: true }));
    input.focus();
  };

  let rightIcon = null;
  // 右侧区域沿用原有优先级：加载 > 密码显隐 > 清空，避免挤占输入空间。

  if (loading) {
    rightIcon = <Spinner role="presentation" aria-hidden="true" aria-label={undefined} />;
  } else if (type === 'password') {
    rightIcon = (
      <InputGroupButton
        size="icon-xs"
        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isPasswordVisible}
        disabled={disabled}
        // 鼠标按下时保留输入焦点；按钮仍可通过 Tab 聚焦并由键盘操作。
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const nextVisible = !isPasswordVisible;
          if (showPassword === undefined) setLocalShowPassword(nextVisible);
          onShowPasswordChange?.(nextVisible);
        }}
      >
        {isPasswordVisible ? <EyeOffIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
      </InputGroupButton>
    );
  } else if (showClear) {
    rightIcon = (
      <InputGroupButton
        size="icon-xs"
        aria-label="Clear input"
        disabled={disabled || readOnly}
        // 鼠标按下时保留输入焦点；按钮仍可通过 Tab 聚焦并由键盘操作。
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleClear}
      >
        <XIcon aria-hidden="true" />
      </InputGroupButton>
    );
  }

  const inputProps = {
    ...props,
    onValueChange: (nextValue: string, details: InputPrimitive.ChangeEventDetails) => {
      if (value === undefined) setLocalValue(nextValue);
      onValueChange?.(nextValue, details);
    },
  };

  return (
    // 使用现有输入组合组件统一处理边框、焦点和附加按钮的布局。
    <InputGroup style={style} className={className}>
      <InputGroupInput
        {...inputProps}
        ref={inputRef}
        type={type === 'password' && isPasswordVisible ? 'text' : type}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        aria-busy={loading || props['aria-busy']}
      />
      {rightIcon && <InputGroupAddon align="inline-end">{rightIcon}</InputGroupAddon>}
    </InputGroup>
  );
});
