import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAgent } from "../api/agentApi";

interface FormData {
  name: string;
  description: string;
  prompt: string;
}

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    prompt: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAgent(form);
      toast.success("✅ Agent created successfully");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Create agent failed", err);
      toast.error("❌ Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="text-center py-12 bg-gradient-to-br from-indigo-600 to-purple-800 text-white shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">🛠️ Create Custom Agent</h1>
        <p className="text-lg text-indigo-100">
          Provide details to configure your new Retell AI agent.
        </p>
      </header>

      {/* Form Section */}
      <main className="flex-grow flex justify-center items-start px-4 sm:px-8 py-12">
        <div className="w-full max-w-2xl bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Agent Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Dispatch Concierge"
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Description
              </label>
              <input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional description"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            {/* Prompt */}
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Agent Prompt
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={form.prompt}
                onChange={handleChange}
                placeholder="Describe how the agent should behave and respond..."
                required
                className="w-full p-3 border-2 border-gray-200 rounded-lg min-h-[150px] resize-y focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-teal-400 to-emerald-500 text-white shadow hover:opacity-90 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2 rounded-lg font-semibold text-white shadow bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition ${
                  submitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateAgent;
