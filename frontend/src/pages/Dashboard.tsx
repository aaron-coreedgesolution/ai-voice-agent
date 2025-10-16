import * as React from "react";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RetellWebClient } from "retell-client-js-sdk";

// ===== Type Definitions =====
interface Agent {
  id: string;
  name: string;
  settings?: {
    scenario_type?: string;
  };
}

interface CallRecord {
  id: string;
  driver_name?: string;
  phone_number?: string;
  load_number?: string;
  agent_id?: string;
  call_outcome?: string;
  transcript?: string;
  structured_data?: {
    retell_call_id?: string;
    recording_url?: string;
    [key: string]: any;
  };
  created_at?: string;
}

interface ActiveCall {
  driver_name: string;
  load_number: string;
  phone_number: string;
  agent_id?: string;
}

interface ApiResponse<T> {
  data: T;
  status: string;
  access_token?: string;
  error?: string;
}

// ===== Component =====
const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [startingCall, setStartingCall] = useState<boolean>(false);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [retellClient, setRetellClient] = useState<RetellWebClient | null>(null);

  // Form states
  const [driverName, setDriverName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loadNumber, setLoadNumber] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  // ===== Fetch Data =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, callsRes] = await Promise.all([
          api.get("/agents/"),
          api.get("/calls/"),
        ]);
        setAgents(agentsRes.data?.data || []);
        setCalls(callsRes.data?.calls || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== End Call =====
  const handleEndCall = async (): Promise<void> => {
    if (!retellClient) {
      setActiveCall(null);
      return;
    }
    try {
      const endFn =
        (retellClient as any).endCall ||
        (retellClient as any).hangUp ||
        (retellClient as any).stopCall ||
        (retellClient as any).disconnect;

      if (typeof endFn === "function") await endFn.call(retellClient);
      toast.info("Call ended by user");
    } catch (err) {
      console.error("Error ending call:", err);
      toast.error("Failed to end call");
    } finally {
      try {
        if (typeof (retellClient as any).removeAllListeners === "function") {
          (retellClient as any).removeAllListeners();
        }
      } catch {}
      setActiveCall(null);
      setRetellClient(null);
      setTimeout(() => refreshCallRecords(), 500);
    }
  };

  // ===== Start Manual Call =====
  const handleStartTestCall = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStartingCall(true);
    try {
      const res = await api.post<ApiResponse<any>>("/calls/start", {
        driver_name: driverName,
        phone_number: phoneNumber,
        load_number: loadNumber,
        agent_id: selectedAgentId || null,
      });

      if (res.data.status === "success" && res.data.access_token) {
        toast.success("Call initiated successfully!");
        const client = new RetellWebClient();
        setRetellClient(client);

        client.on("call_started", () => {
          toast.success("Call started - speak now!");
          setActiveCall({ driver_name: driverName, load_number: loadNumber, phone_number: phoneNumber });
        });

        client.on("call_ended", () => {
          toast.info("Call ended");
          setActiveCall(null);
          setRetellClient(null);
          refreshCallRecords();
        });

        client.on("error", (error: Error) => {
          console.error("Retell call error:", error);
          toast.error(`Call error: ${error.message}`);
          setActiveCall(null);
          setRetellClient(null);
        });

        await client.startCall({ accessToken: res.data.access_token });
        setDriverName("");
        setPhoneNumber("");
        setLoadNumber("");
      } else {
        throw new Error(res.data.error || "Failed to create web call");
      }
    } catch (err) {
      console.error("Start test call error:", err);
      toast.error("Failed to start call.");
    } finally {
      setStartingCall(false);
    }
  };

  // ===== Start Web Call =====
  const handleStartWebCall = async (agentId: string): Promise<void> => {
    setStartingCall(true);
    try {
      const res = await api.post<ApiResponse<any>>("/calls/start", {
        driver_name: "Mike",
        load_number: "7891-B",
        agent_id: agentId,
      });

      if (res.data.status === "success" && res.data.access_token) {
        const client = new RetellWebClient();
        setRetellClient(client);

        client.on("call_started", () => {
          toast.success("Web call started - speak now!");
          setActiveCall({
            driver_name: "Mike",
            load_number: "7891-B",
            phone_number: "WEB_CALL",
            agent_id: agentId,
          });
        });

        client.on("call_ended", () => {
          toast.info("Web call ended");
          setActiveCall(null);
          setRetellClient(null);
          refreshCallRecords();
        });

        client.on("error", (error: Error) => {
          console.error("Retell call error:", error);
          toast.error(`Call error: ${error.message}`);
          setActiveCall(null);
          setRetellClient(null);
        });

        await client.startCall({ accessToken: res.data.access_token });
      } else {
        throw new Error(res.data.error || "Failed to create web call");
      }
    } catch (err) {
      console.error("Failed to start web call:", err);
      toast.error("Could not start web call.");
    } finally {
      setStartingCall(false);
    }
  };

  // ===== Refresh Call Records =====
  const refreshCallRecords = async (): Promise<void> => {
    try {
      const callsRes = await api.get<{ calls: CallRecord[] }>("/calls/");
      setCalls(callsRes.data?.calls || []);
    } catch (err) {
      console.error("Failed to refresh call records:", err);
    }
  };

  // ===== Render States =====
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "4rem", fontSize: "1.3rem" }}>
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#f56565" }}>
        {error}
      </div>
    );

  // ===== Render Dashboard =====
  return (
    <div style={{ padding: "2rem" }}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>🎯 AI Voice Agent Dashboard</h1>

      {/* Active Call */}
      {activeCall && (
        <div>
          <p>Active Call: {activeCall.driver_name}</p>
          <button onClick={handleEndCall}>End Call</button>
        </div>
      )}

      {/* Manual Test Form */}
      <form onSubmit={handleStartTestCall}>
        <select
          value={selectedAgentId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedAgentId(e.target.value)
          }
          required
        >
          <option value="">Select Agent</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          placeholder="Driver Name"
        />
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
        />
        <input
          type="text"
          value={loadNumber}
          onChange={(e) => setLoadNumber(e.target.value)}
          placeholder="Load Number"
        />
        <button
          type="submit"
          disabled={startingCall || activeCall !== null || !selectedAgentId}
        >
          {startingCall ? "Starting..." : "🚀 Start Test Call"}
        </button>
      </form>

      {/* Recent Calls */}
      <h2>Recent Calls</h2>
      {calls.length === 0 ? (
        <p>No calls yet</p>
      ) : (
        <ul>
          {calls.map((call) => (
            <li key={call.id}>
              {call.driver_name || "Unknown"} — {call.call_outcome || "Pending"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
