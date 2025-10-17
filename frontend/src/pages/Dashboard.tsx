import React, { useEffect, useState, FormEvent, useRef } from "react";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import { RetellWebClient } from "retell-client-js-sdk";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import Layout from "../components/Layout";

// ===== Type Definitions =====
interface Agent { id: string; name: string; }
interface CallRecord {
  id: string;
  driver_name?: string;
  phone_number?: string;
  load_number?: string;
  agent_id?: string;
  call_outcome?: string;
  structured_data?: Record<string, any>;
  created_at?: string;
}
interface ActiveCall { driver_name: string; load_number: string; phone_number: string; agent_id?: string; }
interface ApiResponse<T> { data: T; status: string; access_token?: string; error?: string; }

// ===== Dashboard Component =====
const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [startingCall, setStartingCall] = useState(false);
  const [retellClient, setRetellClient] = useState<RetellWebClient | null>(null);

  const retellClientRef = useRef<RetellWebClient | null>(null);

  const [driverName, setDriverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loadNumber, setLoadNumber] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ===== Fetch agents & calls =====
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [agentsRes, callsRes] = await Promise.all([api.get("/agents/"), api.get("/calls/")]);
        if (!mounted) return;
        const fetchedAgents = agentsRes?.data?.data ?? agentsRes?.data?.agents ?? [];
        const fetchedCalls = callsRes?.data?.calls ?? callsRes?.data?.data ?? [];
        setAgents(Array.isArray(fetchedAgents) ? fetchedAgents : []);
        // sort calls by created_at descending (newest first)
        const sortedCalls = Array.isArray(fetchedCalls)
          ? [...fetchedCalls].sort((a, b) => {
              const ta = a?.created_at ? Date.parse(String(a.created_at)) : 0;
              const tb = b?.created_at ? Date.parse(String(b.created_at)) : 0;
              return (tb || 0) - (ta || 0);
            })
          : [];
        setCalls(sortedCalls);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // ===== Refresh Calls =====
  const refreshCallRecords = async () => {
    try {
      const callsRes = await api.get("/calls/");
      const fetchedCalls = callsRes?.data?.calls ?? callsRes?.data?.data ?? [];
      setCalls(Array.isArray(fetchedCalls) ? fetchedCalls : []);
    } catch (err) { console.error(err); }
  };

  // ===== Cleanup Retell client =====
  useEffect(() => {
    retellClientRef.current = retellClient;
    return () => {
      const client = retellClientRef.current;
      if (!client) return;
      try { (client as any)?.endCall?.(); } catch {}
      try { (client as any)?.removeAllListeners?.(); } catch {}
      retellClientRef.current = null;
    };
  }, [retellClient]);

  const handleEndCall = async () => {
    const client = retellClientRef.current || retellClient;
    if (!client) {
      setActiveCall(null);
      setRetellClient(null);
      return;
    }

    try {
      // Some versions of the Retell client expose stopCall(), others endCall(). Try both.
      if (typeof (client as any).stopCall === "function") {
        const maybePromise = (client as any).stopCall();
        if (maybePromise && typeof maybePromise.then === "function") await maybePromise;
      } else if (typeof (client as any).endCall === "function") {
        const maybePromise = (client as any).endCall();
        if (maybePromise && typeof maybePromise.then === "function") await maybePromise;
      } else {
        // Best-effort fallback
        try { (client as any).stopCall?.(); } catch {}
        try { (client as any).endCall?.(); } catch {}
      }

      toast.info("Call ended");
    } catch (err) {
      console.error("Error ending call", err);
      toast.error("Failed to end call");
    }

    setActiveCall(null);
    setRetellClient(null);
    retellClientRef.current = null;
    setTimeout(() => refreshCallRecords(), 500);
  };

  const handleStartTestCall = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStartingCall(true);
    try {
      const res = await api.post<ApiResponse<any>>("/calls/start", { driver_name: driverName, phone_number: phoneNumber, load_number: loadNumber, agent_id: selectedAgentId || null });
      if (res?.data?.status === "success" && res?.data?.access_token) {
        const client = new RetellWebClient();
        setRetellClient(client);
        retellClientRef.current = client;

        (client as any).on?.("call_started", () => {
          toast.success("Call started!");
          setActiveCall({ driver_name: driverName, load_number: loadNumber, phone_number: phoneNumber });
        });
        (client as any).on?.("call_ended", () => { toast.info("Call ended"); setActiveCall(null); refreshCallRecords(); });
        (client as any).on?.("error", (err: Error) => { toast.error(`Call error: ${err.message}`); setActiveCall(null); });

        await (client as any).startCall?.({ accessToken: res.data.access_token });

        setDriverName(""); setPhoneNumber(""); setLoadNumber(""); setSelectedAgentId("");
      } else { throw new Error(res?.data?.error || "Failed to start call"); }
    } catch (err) { console.error(err); toast.error("Failed to start call"); }
    finally { setStartingCall(false); }
  };

  if (loading) return <div className="text-center py-16 text-lg">Loading dashboard...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">🎯 AI Voice Agent Dashboard</h1>
          <div className="text-sm text-gray-500">Welcome back — manage calls and agents</div>
        </div>

        {(activeCall || retellClient) && (
          <Card className="bg-yellow-50 border-l-4 border-yellow-500 p-4 flex justify-between items-center shadow-sm">
            <div>
              <div className="text-sm text-yellow-800">Active Call</div>
              <div className="font-medium">{activeCall ? activeCall.driver_name : 'Starting call...'}</div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="danger" onClick={handleEndCall}>End Call</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card title="🚀 Start Manual Test Call">
              <form onSubmit={handleStartTestCall} className="space-y-4">
                <div>
                  <label htmlFor="agent-select" className="mb-1 block text-sm font-medium text-gray-700">Agent</label>
                  <select
                    id="agent-select"
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    value={selectedAgentId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAgentId(e.target.value)}
                    required
                    disabled={agents.length === 0}
                  >
                    <option value="">Select Agent</option>
                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                </div>

                <FormInput label="Driver Name" placeholder="Driver Name" value={driverName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDriverName(e.target.value)} required />
                <FormInput label="Phone Number" placeholder="Phone Number" value={phoneNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)} required />
                <FormInput label="Load Number" placeholder="Load Number" value={loadNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoadNumber(e.target.value)} />

                <div>
                  <Button type="submit" disabled={startingCall || retellClient !== null || activeCall !== null || !selectedAgentId} fullWidth>
                    {startingCall ? "Starting..." : "Start Call"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Recent Calls">
              {calls.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No calls yet</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {calls.map((call) => {
                      const isOpen = expanded.has(call.id);
                      const variant = call.call_outcome === "Completed" ? "success" : call.call_outcome === "Failed" ? "danger" : "warning";
                      return (
                        <div key={call.id} className="rounded-md shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800 p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            <div>
                              <div className="text-xs text-gray-400">Driver</div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{call.driver_name ?? 'Unknown'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Phone</div>
                              <div className="text-sm text-gray-500">{call.phone_number ?? '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Load</div>
                              <div className="text-sm text-gray-500">{call.load_number ?? '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Outcome</div>
                              <div className="mt-1"><Badge variant={variant}>{call.call_outcome ?? 'Pending'}</Badge></div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm text-gray-500">{call.created_at ? new Date(call.created_at).toLocaleString() : ''}</div>
                            <div className="flex items-center gap-3">
                              <button className="text-sm text-indigo-600 hover:underline" onClick={() => toggleExpanded(call.id)}>{isOpen ? 'Hide details' : 'Show details'}</button>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                              <div className="mb-2"><strong>Structured Data</strong></div>
                              <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(call.structured_data ?? {}, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
  