// src/pages/CallRecords.tsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Loader, { Spinner } from "../components/ui/Loader";
import Layout from "../components/Layout";

type CallRecord = {
  id: string;
  driver_name?: string;
  phone_number?: string;
  load_number?: string;
  call_outcome?: string;
  structured_data?: { recording_url?: string; [k: string]: any };
  created_at?: string;
};

const CallRecords: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/calls/");
      const items: CallRecord[] =
        res?.data?.calls ?? res?.data?.data ?? res?.data ?? [];
      const sorted = Array.isArray(items)
        ? [...items].sort((a, b) => {
            const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0;
            const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0;
            return (tb || 0) - (ta || 0);
          })
        : [];
      setCalls(sorted);
    } catch (err) {
      console.error("Failed to load calls", err);
      toast.error("Failed to load calls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = calls.filter((c) =>
    `${c.driver_name ?? ""} ${c.phone_number ?? ""} ${c.load_number ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const downloadRecording = (url?: string) => {
    if (!url) {
      toast.info("No recording available");
      return;
    }
    window.open(url, "_blank");
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Call Records</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
              placeholder="Search calls..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-60 focus:ring-2 focus:ring-indigo-200"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <button
            onClick={load}
            className="text-sm text-indigo-600 hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="space-y-3">
            <Loader lines={4} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            No matching calls
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => {
              const variant =
                c.call_outcome === "Completed"
                  ? "success"
                  : c.call_outcome === "Failed"
                  ? "danger"
                  : "warning";
              const isOpen = expanded.has(c.id);
              return (
                <div key={c.id} className="rounded-md shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    <div>
                      <div className="text-xs text-gray-400">Driver</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{c.driver_name ?? 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Phone</div>
                      <div className="text-sm text-gray-500">{c.phone_number ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Load</div>
                      <div className="text-sm text-gray-500">{c.load_number ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Outcome</div>
                      <div className="mt-1"><Badge variant={variant}>{c.call_outcome ?? 'Pending'}</Badge></div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleExpanded(c.id)}
                        aria-expanded={isOpen}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {isOpen ? 'Hide details' : 'Show details'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <div className="mb-2"><strong>Structured Data</strong></div>
                      <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(c.structured_data ?? {}, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default CallRecords;
