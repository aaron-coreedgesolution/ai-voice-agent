import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import AgentConfigs from "./pages/AgentConfigs";
import CallRecords from "./pages/CallRecords";
import Dashboard from "./pages/Dashboard";
import CreateAgent from "./pages/CreateAgent";

function Topbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const linkBase = {
    padding: '8px 12px',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none'
  };
  const activeStyles = {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    boxShadow: '0 6px 14px rgba(102,126,234,0.35)'
  };
  return (
    <header className="md:hidden" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <span>🎙️</span>
          <span>AI Voice Agent</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to="/" style={{ ...linkBase, ...(isActive('/') ? activeStyles : {}) }}>🏠 <span>Dashboard</span></Link>
          <Link to="/agents" style={{ ...linkBase, ...(isActive('/agents') ? activeStyles : {}) }}>🤖 <span>Agents</span></Link>
          <Link to="/calls" style={{ ...linkBase, ...(isActive('/calls') ? activeStyles : {}) }}>📞 <span>Calls</span></Link>
        </nav>
      </div>
    </header>
  );
}

// Sidebar removed per request; using Topbar across all sizes

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Topbar />
        <main className="content">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<AgentConfigs />} />
              <Route path="/calls" element={<CallRecords />} />
              <Route path="/agents/create" element={<CreateAgent />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
