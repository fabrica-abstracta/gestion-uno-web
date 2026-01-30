import type { InputHTMLAttributes, ReactNode } from "react";
import Label from "./label";

export interface CheckboxProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  helperText?: ReactNode;

  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
}

export default function Checkbox({
  label,
  helperText,

  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  helperClassName = "",

  className,
  ...inputProps
}: CheckboxProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <Label className={labelClassName}>
          {label}
        </Label>
      )}

      <input
        type="checkbox"
        {...inputProps}
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
