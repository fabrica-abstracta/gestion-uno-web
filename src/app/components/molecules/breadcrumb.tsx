import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="breadcrumb-item">
              {!isLast && item.to ? (
                <Link to={item.to} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb-current">
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className="breadcrumb-separator">/</span>
              )}
            </div>
          );
        })}
      </nav>

      <style>{`
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-link {
          color: #6b7280;
          text-decoration: none;
        }

        .breadcrumb-link:hover {
          color: #1f2937;
          text-decoration: underline;
        }

        .breadcrumb-current {
          color: #1f2937;
          font-weight: 500;
        }

        .breadcrumb-separator {
          color: #9ca3af;
        }
      `}</style>
    </>
  );
}
