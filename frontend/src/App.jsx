import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AgentConfigs from "./pages/AgentConfigs";
import CallRecords from "./pages/CallRecords";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="p-4">
        <nav className="flex gap-4 mb-6">
          <Link to="/">Dashboard</Link>
          <Link to="/agents">Agent Configs</Link>
          <Link to="/calls">Call Records</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<AgentConfigs />} />
          <Route path="/calls" element={<CallRecords />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
