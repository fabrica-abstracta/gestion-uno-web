import type { LabelHTMLAttributes } from "react";

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> { }

export default function Label({
  children,
  className,
  ...props
}: LabelProps) {
  return (
    <label
      className={className}
      {...props}
    >
      {children}
    </label>
  );
}
