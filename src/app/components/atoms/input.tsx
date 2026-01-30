import type { InputHTMLAttributes, ReactNode } from "react";
import Label from "./label";

export interface FieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  helperText?: ReactNode;

  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
}

export default function Input({
  label,
  helperText,

  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  helperClassName = "",

  ...inputProps
}: FieldProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <Label className={labelClassName}>
          {label}
        </Label>
      )}

      <input
        {...inputProps}
        className={`${inputClassName}`}
      />

      {helperText && (
        <p className={helperClassName}>
          {helperText}
        </p>
      )}
    </div>
  );
}
