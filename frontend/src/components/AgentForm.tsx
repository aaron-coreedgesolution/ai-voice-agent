import React, { useState, ChangeEvent, FormEvent } from "react";
import Button from "./ui/Button";

export interface AgentFormData {
  name: string;
  description: string;
  prompt: string;
}

interface AgentFormProps {
  onSubmit: (data: AgentFormData) => void;
  initialData?: Partial<AgentFormData>;
}

const AgentForm: React.FC<AgentFormProps> = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState<AgentFormData>({
    name: initialData.name || "",
    description: initialData.description || "",
    prompt: initialData.prompt || "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-2xl p-6 space-y-4 border border-gray-200"
    >
      <h2 className="text-2xl font-semibold text-gray-800">
        Agent Configuration
      </h2>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="name">
          Agent Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Dispatch Assistant"
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what this agent does..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="prompt">
          Conversation Prompt
        </label>
        <textarea
          id="prompt"
          name="prompt"
          value={formData.prompt}
          onChange={handleChange}
          placeholder="Provide the main prompt or conversation script..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />
      </div>

      {/* Advanced Settings removed from the UI; it's handled server-side/defaults */}

      <div className="pt-2">
        <Button type="submit" variant="primary" className="w-full">
          Save Agent
        </Button>
      </div>
    </form>
  );
};

export default AgentForm;
