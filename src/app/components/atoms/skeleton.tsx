interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

interface SkeletonTextProps {
  loading: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SkeletonText({ loading, className, children }: SkeletonTextProps) {
  if (loading) {
    return <Skeleton className={className} />;
  }

  return <>{children}</>;
}
