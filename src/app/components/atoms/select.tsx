import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Label from "./label";
import { flexColGap2, formTextStyles, inputStyles } from "../../core/helpers/styles";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  optionSelectedClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export default function Select({
  label,
  helperText,
  error,
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  containerClassName = flexColGap2,
  labelClassName = formTextStyles.label,
  inputClassName = inputStyles.base,
  dropdownClassName = "",
  optionClassName = "",
  optionSelectedClassName = "",
  helperClassName = "",
  errorClassName = "text-xs text-red-600 mt-1",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const menuHeight = options.length * 32 + 16;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldFlip = spaceBelow < menuHeight && rect.top > menuHeight;

      setPosition({
        top: shouldFlip ? rect.top - menuHeight : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
      setIsPositioned(true);
    } else {
      setIsPositioned(false);
    }
  }, [open, options.length]);

  return (
    <div className={`w-full text-sm text-gray-700 ${containerClassName}`}>
      {label && (
        <Label className={labelClassName}>
          {label}
        </Label>
      )}

      <input
        ref={inputRef}
        readOnly
        value={selected?.label ?? ""}
        placeholder={placeholder}
        onClick={() => setOpen(!open)}
        className={`cursor-pointer ${inputClassName}`}
      />

      {open &&
        isPositioned &&
        createPortal(
          <div
            className={`fixed z-[99999] rounded-lg border border-gray-300 bg-white py-2 shadow-lg ${dropdownClassName}`}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                    setIsPositioned(false);
                  }}
                  className={`flex items-center px-4 py-1.5 cursor-pointer hover:bg-blue-100 ${isSelected
                      ? `bg-blue-500 text-white ${optionSelectedClassName}`
                      : optionClassName
                    }`}
                >
                  {option.label}
                </div>
              );
            })}
          </div>,
          document.body
        )}

      {helperText && (
        <p className={helperClassName}>
          {helperText}
        </p>
      )}

      {error && (
        <p className={errorClassName}>
          {error}
        </p>
      )}
    </div>
  );
}
