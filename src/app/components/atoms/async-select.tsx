import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Label from "./label";
import api from "../../core/config/axios";
import { flexColGap2, formTextStyles, inputStyles } from "../../core/helpers/styles";

interface Option {
  label: string;
  value: string;
}

interface AsyncSelectProps {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  endpoint: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  initialOption?: { label: string; value: string } | null;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  optionSelectedClassName?: string;
  helperClassName?: string;
  errorClassName?: string;
}

export default function AsyncSelect({
  label,
  helperText,
  error,
  endpoint,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  initialOption = null,
  containerClassName = flexColGap2,
  labelClassName = formTextStyles.label,
  inputClassName = inputStyles.base,
  dropdownClassName = "",
  optionClassName = "",
  optionSelectedClassName = "",
  helperClassName = "",
  errorClassName = "text-xs text-red-600 mt-1",
}: AsyncSelectProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (initialOption && value === initialOption.value) {
      const exists = options.some(o => o.value === initialOption.value);
      if (!exists) {
        setOptions(prev => {
          return [initialOption, ...prev.filter(o => o.value !== "")];
        });
      }
    }
  }, [initialOption, value]);

  const loadOptions = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await api.post(endpoint, {
        name: search,
        page: 1,
        perPage: 5,
      });

      const data = response.data.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));

      setOptions([...data]);
      setTotalItems(response.data.pagination.totalItems);
    } catch (err) {
      setOptions([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadOptions(searchTerm);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        loadOptions(searchTerm);
      }, searchTerm === "" ? 0 : 300);
    }

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, open]);

  useEffect(() => {
    const updatePosition = () => {
      if (open && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const menuHeight = options.length * 32 + 60;
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
    };

    updatePosition();

    if (open) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, options.length]);

  return (
    <div className={`w-full text-sm text-gray-700 ${containerClassName}`}>
      {label && <Label className={labelClassName}>{label}</Label>}

      <div className="relative">
        <input
          ref={inputRef}
          value={open ? searchTerm : (value ? selected?.label ?? "" : "")}
          placeholder={placeholder}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setOpen(true)}
          className={inputClassName}
        />

        {value && !open && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open &&
        isPositioned &&
        createPortal(
          <div
            className={`fixed z-[99999] rounded-lg border border-gray-300 bg-white shadow-lg ${dropdownClassName}`}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            <div className="py-2 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center px-4 py-2 text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Cargando...
                </div>
              ) : options.length === 1 && options[0].value === "" ? (
                <div className="px-4 py-2 text-gray-500 text-center">
                  No se encontraron resultados
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <div
                      key={option.value}
                      onClick={() => {
                        onChange?.(option.value);
                        setOpen(false);
                        setIsPositioned(false);
                        setSearchTerm("");
                      }}
                      className={`flex items-center px-4 py-1.5 cursor-pointer hover:bg-blue-100 ${isSelected
                          ? `bg-blue-500 text-white ${optionSelectedClassName}`
                          : optionClassName
                        }`}
                    >
                      {option.label}
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-600">
              Total de elementos: {totalItems}
            </div>
          </div>,
          document.body
        )}

      {helperText && <p className={helperClassName}>{helperText}</p>}

      {error && <p className={errorClassName}>{error}</p>}

      {open && (
        <div
          className="fixed inset-0 z-[99998]"
          onClick={() => {
            setOpen(false);
            setIsPositioned(false);
            setSearchTerm("");
          }}
        />
      )}
    </div>
  );
}
