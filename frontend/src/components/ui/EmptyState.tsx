import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

type EmptyAction = { label: string; onClick?: () => void; to?: string };

const EmptyState: React.FC<{ title?: string; subtitle?: string; action?: EmptyAction }> = ({ title = "Nothing here", subtitle = "", action }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!action) return;
    if (action.onClick) return action.onClick();
    if (action.to) return navigate(action.to);
  };

  return (
    <div className="py-12 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-4 text-6xl">✨</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
        {action && <Button onClick={handleClick}>{action.label}</Button>}
      </div>
    </div>
  );
};

export default EmptyState;