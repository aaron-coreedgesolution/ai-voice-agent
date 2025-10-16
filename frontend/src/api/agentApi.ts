// src/api/agentApi.ts
import api from "./api";

// Define Agent interface (you can adjust based on your backend schema)
export interface Agent {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  [key: string]: any; // for flexibility with additional properties
}

// Define input data type for creating an agent
export interface CreateAgentData {
  name: string;
  description?: string;
  // add any other required fields
}

// Fetch all agents
export const getAgents = async () => {
  const response = await api.get<Agent[]>("/agents/");
  return response.data;
};

// Create a new agent
export const createAgent = async (data: CreateAgentData) => {
  const response = await api.post<Agent>("/agents/", data);
  return response.data;
};

// Delete an agent by ID
export const deleteAgent = async (id: string) => {
  const response = await api.delete<{ success: boolean }>(`/agents/${id}`);
  return response.data;
};
