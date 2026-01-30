import type { HTMLAttributes } from "react";

export interface FooterProps
  extends HTMLAttributes<HTMLElement> { }

export default function Footer({
  children,
  className,
  ...props
}: FooterProps) {
  return (
    <footer
      className={className}
      {...props}
    >
      {children}
    </footer>
  );
}
