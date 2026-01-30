import { useEffect, useMemo, useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeId?: string;
  orientation?: "vertical" | "horizontal";
  onTabChange?: (tabId: string) => void;
}

export default function Tabs({
  items,
  activeId,
  orientation = "vertical",
  onTabChange,
}: TabsProps) {
  const initialIndex = useMemo(() => {
    if (!activeId) return 0;
    const index = items.findIndex((item) => item.id === activeId);
    return index !== -1 ? index : 0;
  }, [activeId, items]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentTab = items[currentIndex];

  if (orientation === "horizontal") {
    return (
      <div className="flex flex-col gap-2 min-w-0">
        <nav className="border-b border-gray-200 overflow-x-hidden">
          <div className="flex gap-2 overflow-x-auto">
            {items.map((item, index) => {
              const isActive = index === currentIndex;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    onTabChange?.(item.id);
                  }}
                  className={`
                    flex items-center gap-2 shrink-0 px-3 py-[7px] text-sm rounded-md transition
                    ${isActive
                      ? "text-gray-900 font-semibold cursor-default"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <section key={currentTab?.id} className="flex-1 min-w-0 py-4">
          {currentTab?.content}
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10 min-w-0">
      <nav className="flex flex-col gap-1 border-b border-gray-200 pb-4 md:hidden">
        {items.map((item, index) => {
          const isActive = index === currentIndex;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setCurrentIndex(index);
                onTabChange?.(item.id);
              }}
              className={`
                px-3 py-2 text-left text-sm rounded-md transition
                ${isActive
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <aside className="hidden w-[240px] shrink-0 md:block">
        <nav className="flex flex-col gap-1">
          {items.map((item, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setCurrentIndex(index);
                  onTabChange?.(item.id);
                }}
                className={`
                  px-3 py-2 text-left text-sm rounded-md transition
                  ${isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="flex-1 min-w-0">
        {currentTab?.content}
      </section>
    </div>
  );
}
