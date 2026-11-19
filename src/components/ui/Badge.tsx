import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
}) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    brand: "bg-henu-50 text-henu-700 border-henu-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export function getStatusBadgeVariant(
  status: string,
): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "PUBLISHED":
    case "PROCESSED":
    case "VERIFIED":
      return "success";
    case "VALIDATED":
    case "APPROVED":
    case "PROCESSING":
    case "PENDING":
      return "info";
    case "DRAFT":
    case "MAINTENANCE":
    case "IGNORED":
      return "warning";
    case "REJECTED":
    case "REVOKED":
    case "FAILED":
    case "DEPRECATED":
    case "ARCHIVED":
      return "danger";
    default:
      return "neutral";
  }
}
