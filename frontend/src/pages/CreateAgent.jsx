import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAgent } from "../api/agentApi";

export default function CreateAgent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    prompt: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        prompt: form.prompt,
      };

      await createAgent(payload);
      toast.success("Agent created successfully");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Create agent failed", err);
      toast.error("Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    content: { maxWidth: '960px', margin: '0 auto', padding: '2rem', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', minHeight: '100vh' },
    header: { textAlign: 'center', marginBottom: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden' },
    headerPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.3 },
    title: { fontSize: '2rem', fontWeight: 800, margin: 0, position: 'relative', zIndex: 1 },
    subtitle: { fontSize: '1rem', opacity: 0.95, fontWeight: 400, marginTop: '0.5rem', position: 'relative', zIndex: 1 },
    card: { background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem' },
    input: { width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', background: '#ffffff' },
    textarea: { width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', background: '#ffffff', minHeight: '160px', resize: 'vertical' },
    actions: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
    primaryBtn: { padding: '0.875rem 1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
    secondaryBtn: { padding: '0.875rem 1rem', background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.headerPattern}></div>
          <h1 style={styles.title}>🛠️ Create Custom Agent</h1>
          <p style={styles.subtitle}>Provide the details to create a new Retell agent</p>
        </div>
        <div style={styles.card}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Agent Name</label>
              <input name="name" value={form.name} onChange={handleChange} style={styles.input} placeholder="e.g. Dispatch Concierge" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input name="description" value={form.description} onChange={handleChange} style={styles.input} placeholder="Optional description" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Agent Prompt</label>
              <textarea name="prompt" value={form.prompt} onChange={handleChange} style={styles.textarea} placeholder="Describe how the agent should behave and respond" required />
            </div>
            <div style={styles.actions}>
              <button type="button" onClick={() => navigate(-1)} style={styles.secondaryBtn}>Cancel</button>
              <button type="submit" disabled={submitting} style={styles.primaryBtn}>{submitting ? 'Creating...' : 'Create Agent'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


