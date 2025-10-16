// src/pages/CallRecords.tsx
import React, { useEffect, useState } from "react";
import api from "../api";

interface CallRecord {
  id: string | number;
  driver_name: string;
  phone_number: string;
  load_number?: string;
  call_outcome?: string;
  transcript?: string;
  structured_data?: Record<string, any>;
}

interface CallStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
}

export default function CallRecords(): React.ReactElement {
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<string | number | null>(
    null
  );

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get("/calls/");
        setRecords(res.data?.calls || res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch call records:", err);
        setError("Failed to load call records.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const getOutcomeBadge = (outcome?: string): React.ReactElement => {
    let badgeColor =
      "bg-indigo-100 text-indigo-800"; // default (pending/in-progress)
    if (
      outcome === "Completed" ||
      outcome === "Emergency Escalation" ||
      outcome === "In-Transit Update" ||
      outcome === "Arrival Confirmation"
    ) {
      badgeColor = "bg-green-100 text-green-800";
    } else if (outcome === "Failed") {
      badgeColor = "bg-red-100 text-red-800";
    } else if (outcome === "Pending" || outcome === "In Progress") {
      badgeColor = "bg-yellow-100 text-yellow-800";
    }

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${badgeColor}`}
      >
        {outcome || "Pending"}
      </span>
    );
  };

  const getCallStats = (): CallStats => {
    const total = records.length;
    const completed = records.filter(
      (r) =>
        r.call_outcome === "Completed" ||
        r.call_outcome === "Emergency Escalation" ||
        r.call_outcome === "In-Transit Update" ||
        r.call_outcome === "Arrival Confirmation"
    ).length;
    const failed = records.filter((r) => r.call_outcome === "Failed").length;
    const pending = records.filter(
      (r) => !r.call_outcome || r.call_outcome === "Pending"
    ).length;

    return { total, completed, failed, pending };
  };

  const stats = getCallStats();

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="text-4xl mb-3 animate-pulse">⏳</div>
        <p className="text-lg">Loading call records...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="text-4xl mb-3">❌</div>
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-6 py-10 bg-white/90 backdrop-blur-lg min-h-screen">
        {/* Header */}
        <header className="relative bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center rounded-3xl py-12 mb-12 shadow-lg overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23fff%22 fill-opacity=%220.2%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
          <h1 className="relative text-4xl font-extrabold z-10">📊 Call Records</h1>
          <p className="relative text-lg font-light mt-2 z-10">
            Review and analyze voice agent call history
          </p>
        </header>

        {/* Stats Bar */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-xl shadow text-center py-5">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.total}
              </div>
              <div className="text-gray-500 text-sm">Total Calls</div>
            </div>
            <div className="bg-white rounded-xl shadow text-center py-5">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-gray-500 text-sm">Completed</div>
            </div>
            <div className="bg-white rounded-xl shadow text-center py-5">
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
              <div className="text-gray-500 text-sm">Failed</div>
            </div>
            <div className="bg-white rounded-xl shadow text-center py-5">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-gray-500 text-sm">Pending</div>
            </div>
          </div>
        )}

        {/* Call Records Table */}
        {records.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                <tr>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Load #</th>
                  <th className="p-3">Outcome</th>
                  <th className="p-3">Transcript</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t hover:bg-gray-50 transition"
                    onClick={() =>
                      setExpandedRecord(
                        expandedRecord === record.id ? null : record.id
                      )
                    }
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {record.driver_name}
                    </td>
                    <td className="p-3 text-gray-600">
                      {record.phone_number}
                    </td>
                    <td className="p-3 text-gray-600">
                      {record.load_number || "-"}
                    </td>
                    <td className="p-3">{getOutcomeBadge(record.call_outcome)}</td>
                    <td className="p-3 text-sm text-gray-700 truncate max-w-xs">
                      {record.transcript || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-700">No call records found.</p>
        )}
      </div>
    </div>
  );
}
