export type PaginationState = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const paginationDefault: PaginationState = {
  page: 1,
  perPage: 10,
  totalItems: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false
};

export interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, totalItems, hasNext, hasPrev } = pagination;

  const getPages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page === 1) return [1, 2, 3];
    if (page === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [page - 1, page, page + 1];
  };

  const pages = getPages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
      <span className="text-center sm:text-left">
        Página {page} de {totalPages} · {totalItems} elementos
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={!hasPrev}
          onClick={() => hasPrev && onPageChange(page - 1)}
          className={`flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white transition ${hasPrev
            ? "hover:bg-gray-100"
            : "opacity-40 cursor-not-allowed pointer-events-none bg-gray-100"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            className="w-4 h-4 fill-gray-500"
          >
            <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
          </svg>
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 text-sm transition ${p === page
              ? "bg-gray-200 font-medium"
              : "bg-white hover:bg-gray-100"
              }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={!hasNext}
          onClick={() => hasNext && onPageChange(page + 1)}
          className={`flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white transition ${hasNext
            ? "hover:bg-gray-100"
            : "opacity-40 cursor-not-allowed pointer-events-none bg-gray-100"
            }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            className="w-4 h-4 fill-gray-500"
          >
            <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
