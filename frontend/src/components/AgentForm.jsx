// src/components/AgentForm.jsx
import { useState } from "react";

export default function AgentForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    prompt: initialData.prompt || "",
    settings: initialData.settings || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-3"
    >
      <h2 className="text-lg font-semibold">Agent Configuration</h2>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Agent Name"
        className="border p-2 rounded"
        required
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Agent Description"
        className="border p-2 rounded"
      />

      <textarea
        name="prompt"
        value={formData.prompt}
        onChange={handleChange}
        placeholder="Conversation Prompt"
        rows="4"
        className="border p-2 rounded"
      />

      <textarea
        name="settings"
        value={formData.settings}
        onChange={handleChange}
        placeholder="Advanced Settings (JSON or text)"
        rows="3"
        className="border p-2 rounded"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
      >
        Save Agent
      </button>
    </form>
  );
}
