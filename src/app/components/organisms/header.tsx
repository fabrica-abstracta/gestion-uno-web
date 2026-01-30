import type { HTMLAttributes } from "react";

export interface HeaderProps
  extends HTMLAttributes<HTMLElement> { }

export default function Header({
  children,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={className}
      {...props}
    >
      {children}
    </header>
  );
}
