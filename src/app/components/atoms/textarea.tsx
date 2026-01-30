import type { TextareaHTMLAttributes, ReactNode } from "react";
import Label from "./label";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helperText?: ReactNode;

  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  helperClassName?: string;
}

export default function Textarea({
  label,
  helperText,

  containerClassName = "",
  labelClassName = "",
  textareaClassName = "",
  helperClassName = "",

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

      {helperText && (
        <p className={helperClassName}>
          {helperText}
        </p>
      )}
    </div>
  );
}
