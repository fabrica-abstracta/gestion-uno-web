import type { TableHTMLAttributes, ReactNode } from "react";
import type { PaginationProps } from "./pagination";
import Pagination from "./pagination";

export interface Paginated<T> {
  load: "idle" | "loading" | "ok" | "error";
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;

  className?: string;
  headerClassName?: string;
  cellClassName?: string;

  width?: string;
  minWidth?: string;
  maxWidth?: string;
};

export interface TableProps<T>
  extends TableHTMLAttributes<HTMLTableElement>, PaginationProps {
  columns: Column<T>[];
  data: T[];
  load: "idle" | "loading" | "ok" | "error";
  heightClass?: string;
  loadingNode?: ReactNode;
  emptyNode?: ReactNode;
  errorNode?: ReactNode;
}

export default function Table<T>({
  columns,
  data,
  load,
  pagination,
  onPageChange,

  heightClass = "h-72",

  loadingNode,
  emptyNode,
  errorNode,
  ...props
}: TableProps<T>) {
  const getStyle = (col: Column<T>) => ({
    width: col.width,
    minWidth: col.minWidth ?? "140px",
    maxWidth: col.maxWidth ?? "9999px",
  });

  const renderTbody = () => {
    if (load === "loading")
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className="py-8 text-center">
              {loadingNode}
            </td>
          </tr>
        </tbody>
      );

    if (load === "error")
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className="py-8 text-center">
              {errorNode}
            </td>
          </tr>
        </tbody>
      );

    if (load === "ok" && data.length === 0)
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className="py-8 text-center">
              {emptyNode}
            </td>
          </tr>
        </tbody>
      );

    return (
      <tbody className="divide-y divide-gray-200">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td
                key={col.key}
                style={getStyle(col)}
                className={`px-4 py-3 align-middle whitespace-nowrap ${col.className ?? ""
                  } ${col.cellClassName ?? ""}`}
              >
                {col.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return <>
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden min-w-0">
      <div className={`${heightClass} overflow-x-auto overflow-y-auto min-w-0`}>
        <table
          className="min-w-max w-full border-collapse text-sm table-auto"
          {...props}
        >
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-600">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={getStyle(col)}
                  className={`px-4 py-3 font-medium border-b border-gray-200 text-left whitespace-nowrap ${col.headerClassName ?? ""
                    }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {renderTbody()}
        </table>
      </div>
    </div>

    {pagination && onPageChange && (
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    )}
  </>
}
