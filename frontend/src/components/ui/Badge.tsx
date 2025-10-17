import React from "react";

type BadgeVariant = "success" | "danger" | "warning" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  neutral: "bg-gray-100 text-gray-800",
};

type BadgeProps = {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className = "" }) => {
  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;