// src/pages/AgentConfigs.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import Layout from "../components/Layout";

type Agent = {
  id: string;
  name: string;
};

const AgentConfigs: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/agents/");
      const items: Agent[] = res?.data?.data ?? res?.data?.agents ?? res?.data ?? [];
      setAgents(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed loading agents", err);
      toast.error("Failed loading agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post("/agents/", { name: name.trim() });
      toast.success("Agent created");
      setName("");
      await loadAgents();
    } catch (err) {
      console.error("Create agent failed", err);
      toast.error("Create failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete agent?")) return;
    try {
      await api.delete(`/agents/${id}`);
      toast.info("Agent deleted");
      setAgents((s) => s.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Delete agent failed", err);
      toast.error("Delete failed");
    }
  };

  const filtered = agents.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Agent Configs</h1>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="Search agents..."
            className="pl-3 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-56 focus:ring-2 focus:ring-indigo-200"
          />
          <button onClick={loadAgents} className="text-sm text-indigo-600 hover:underline">Refresh</button>
          <Button onClick={() => navigate('/agents/create')} variant="primary">Create Agent</Button>
        </div>
      </div>


      <div className="mt-6">
        <Card title="Existing Agents">
          {loading ? (
            <Loader lines={4} />
          ) : filtered.length === 0 ? (
            <EmptyState title="No agents found" subtitle="Create your first agent to get started" action={{ label: "Create agent", to: "/agents/create" }} />
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((a) => (
                <li key={a.id} className="py-2 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {a.id}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigator.clipboard.writeText(a.id)} variant="secondary" size="sm">Copy ID</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(a.id)}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default AgentConfigs;
