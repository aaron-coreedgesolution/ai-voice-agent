import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") ?? "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-extrabold tracking-tight">AI Voice Agent</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Manage calls & agents</div>
          </div>

          <nav className="flex items-center space-x-4 text-sm">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Dashboard</Link>
            <Link to="/calls" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Call Records</Link>
            <Link to="/agents" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Agents</Link>
            <Link to="/agents/create" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Create Agent</Link>

            <button
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              className="ml-4 p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 transform transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;