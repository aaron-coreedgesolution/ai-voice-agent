// src/pages/AgentConfigs.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

interface AgentSettings {
  scenario_type?: string;
  [key: string]: any;
}

interface AgentConfig {
  id: string | number;
  name: string;
  description?: string;
  settings?: AgentSettings;
}

export default function AgentConfigs() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await api.get("/agents/");
        const data = res.data?.data || res.data?.agents || res.data || [];
        setConfigs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching agent configs:", err);
        setError("Failed to load agent configurations.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleStartCall = async (agentId: string | number) => {
    setStartingId(agentId);
    try {
      await api.post("/calls/start", {
        driver_name: "Mike",
        load_number: "TEST-LOAD",
        agent_id: agentId,
      });
    } catch {
      // backend handles validation
    } finally {
      setStartingId(null);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-600">Loading agent configurations...</p>
    );

  if (error)
    return (
      <p className="p-6 text-red-500 font-medium">{error}</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-6 py-10 bg-white/90 backdrop-blur-lg min-h-screen">
        {/* Header */}
        <header className="relative bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center rounded-3xl py-12 mb-12 shadow-lg overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23fff%22 fill-opacity=%220.2%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/svg%3E')]"></div>
          <h1 className="relative text-4xl font-extrabold z-10">🤖 Agents</h1>
          <p className="relative text-lg font-light mt-2 z-10">
            Create and manage your custom AI agents
          </p>
        </header>

        {/* Create Agent Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/agents/create")}
            className="px-5 py-2.5 font-semibold rounded-lg text-white bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 transition"
          >
            + Create Agent
          </button>
        </div>

        {/* Agent Cards */}
        {configs.length === 0 ? (
          <p className="text-gray-700">No agents configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map((agent) => {
              const scenarioType = agent.settings?.scenario_type;
              const isScenarioAgent = Boolean(scenarioType);

              return (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-800">
                      {agent.name}
                    </h3>
                    {isScenarioAgent && (
                      <span className="text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                        Scenario
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm">
                    {agent.description || "No description provided."}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Type:{" "}
                    {isScenarioAgent
                      ? scenarioType === "dispatch_checkin"
                        ? "Dispatch Check-in"
                        : "Emergency Protocol"
                      : "Custom"}
                  </p>

                  <button
                    onClick={() => handleStartCall(agent.id)}
                    disabled={startingId === agent.id}
                    className={`w-full mt-4 py-2 font-semibold rounded-lg text-white transition ${
                      startingId === agent.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-br from-teal-400 to-emerald-500 hover:opacity-90"
                    }`}
                  >
                    {startingId === agent.id ? "Starting..." : "Start Call"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
