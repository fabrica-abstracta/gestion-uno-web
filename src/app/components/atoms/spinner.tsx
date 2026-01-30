import type { HTMLAttributes } from "react";

export interface SpinnerProps
  extends HTMLAttributes<HTMLSpanElement> { }

export default function Spinner({
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      className={className}
      {...props}
    />
  );
}
