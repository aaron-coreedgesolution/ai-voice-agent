import React from "react";

type CardProps = {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ title, actions, className = "", children }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <span className="inline-block w-2 h-6 rounded bg-gradient-to-b from-accent to-accent/70 mr-2"></span>
            {title}
          </div>
          {actions && <div className="space-x-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;