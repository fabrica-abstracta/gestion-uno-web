import type { InputHTMLAttributes, ReactNode } from "react";
import Label from "./label";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: ReactNode;
  helperText?: ReactNode;

  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  
  onChange?: (checked: boolean) => void;
}

export default function Switch({
  label,
  helperText,

  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  helperClassName = "",

  className,
  onChange,
  ...inputProps
}: SwitchProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <Label className={labelClassName}>
          {label}
        </Label>
      )}

      <input
        type="checkbox"
        role="switch"
        {...inputProps}
        onChange={(e) => onChange?.(e.target.checked)}
        className={`${inputClassName} ${className ?? ""}`}
      />

      {helperText && (
        <p className={helperClassName}>
          {helperText}
        </p>
      )}
    </div>
  );
}
