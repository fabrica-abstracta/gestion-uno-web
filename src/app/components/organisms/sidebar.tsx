import { useEffect, useRef } from "react";
import type { HTMLAttributes } from "react";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
}

export default function Sidebar({
  open,
  onClose,
  side = "left",
  children,
  ...props
}: SidebarProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sideClasses =
    side === "left"
      ? "-translate-x-full left-0"
      : "translate-x-full right-0";

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      <aside
        ref={ref}
        className={`fixed top-0 z-[100] h-full w-72 bg-white transform transition-transform duration-300 ease-out ${open ? "translate-x-0" : sideClasses
          } ${side === "left" ? "left-0" : "right-0"}`}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}
