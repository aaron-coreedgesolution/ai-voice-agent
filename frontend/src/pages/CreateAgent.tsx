import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";
import Card from "../components/ui/Card";
import Layout from "../components/Layout";
import AgentForm, { AgentFormData } from "../components/AgentForm";

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();

  const handleCreate = async (data: AgentFormData) => {
    try {
      // Do not send advanced settings from the client; backend will use defaults or populate Retell settings
      await api.post("/agents/", { name: data.name, description: data.description, prompt: data.prompt });
      toast.success("Agent created");
      navigate("/agents");
    } catch (err) {
      console.error("Create agent error", err);
      toast.error("Failed to create agent");
    }
  };

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold text-center">Create Agent</h1>
          <Card className="w-full">
            <AgentForm onSubmit={handleCreate} />
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAgent;
