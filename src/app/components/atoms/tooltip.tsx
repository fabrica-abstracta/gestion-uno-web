import type { HTMLAttributes } from "react";

export interface TooltipProps
  extends HTMLAttributes<HTMLDivElement> { }

export default function Tooltip({
  children,
  className,
  ...props
}: TooltipProps) {
  return (
    <div
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
