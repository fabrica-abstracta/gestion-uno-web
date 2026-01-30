import type { InputHTMLAttributes, ReactNode } from "react";
import Label from "./label";
import { flexColGap2, formTextStyles, inputStyles } from "../../core/helpers/styles";

export interface FieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;

  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export default function Input({
  label,
  helperText,
  error,

  containerClassName = flexColGap2,
  labelClassName = formTextStyles.label,
  inputClassName = inputStyles.base,
  helperClassName = formTextStyles.helper,
  errorClassName = formTextStyles.error,

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
        className={`${inputClassName} ${error ? inputStyles.error : ""}`}
      />

      {error && (
        <p className={errorClassName}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className={helperClassName}>
          {helperText}
        </p>
      )}
    </div>
  );
}
