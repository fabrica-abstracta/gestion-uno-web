import type { TextareaHTMLAttributes, ReactNode } from "react";
import Label from "./label";
import { flexColGap2, formTextStyles, inputStyles } from "../../core/helpers/styles";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;

  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export default function Textarea({
  label,
  helperText,
  error,

  containerClassName = flexColGap2,
  labelClassName = formTextStyles.label,
  textareaClassName = inputStyles.base,
  helperClassName = formTextStyles.helper,
  errorClassName = formTextStyles.error,

  className,
  ...textareaProps
}: TextareaProps) {
  return (
    <div className={containerClassName}>
      {label && (
        <Label className={labelClassName}>
          {label}
        </Label>
      )}

      <textarea
        {...textareaProps}
        className={`${textareaClassName} ${className ?? ""}`}
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
