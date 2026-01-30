interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export default function Badge({ label, color = "#6B7280", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${className}`}
      style={{ backgroundColor: color, color: "#FFFFFF" }}
    >
      {label}
    </span>
  );
}
