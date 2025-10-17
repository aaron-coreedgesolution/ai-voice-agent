import React from "react";

export const Spinner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  </div>
);

const SkeletonLine: React.FC<{ width?: string }> = ({ width = "w-full" }) => (
  <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${width} animate-pulse`}></div>
);

export default function Loader({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="py-2">
          <SkeletonLine />
        </div>
      ))}
    </div>
  );
}
