import { BrowserRouter, Routes, Route } from "react-router-dom";
import AgentConfigs from "./pages/AgentConfigs";
import CallRecords from "./pages/CallRecords";
import Dashboard from "./pages/Dashboard";
import CreateAgent from "./pages/CreateAgent";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<AgentConfigs />} />
        <Route path="/calls" element={<CallRecords />} />
        <Route path="/agents/create" element={<CreateAgent />} />
      </Routes>
    </BrowserRouter>
  );
}
