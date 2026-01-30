import type { ReactNode } from "react";

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText: ReactNode;
  normalText: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export default function LoadingButton({
  isLoading,
  loadingText,
  normalText,
  className = "",
  disabled = false,
  onClick,
  type = "button",
}: LoadingButtonProps) {
  const isDisabled = disabled || isLoading;
  
  return (
    <button
      type={type}
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {isLoading ? loadingText : normalText}
    </button>
  );
}
