import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
}

export default function Button({
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}
